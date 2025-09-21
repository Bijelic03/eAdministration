// handlers/user_handler.go
package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	repo "github.com/Bijelic03/eAdministration/project/microservices/auth/repositories"
)

type UserRepo interface {
	Login(ctx context.Context, email, password string) (*repo.User, error)
	Register(ctx context.Context, u repo.User) (*repo.User, error)
}

type UserHandler struct {
	repo UserRepo
	auth *Auth
}

func NewUserHandler(r UserRepo, secretKey []byte) *UserHandler {
	return &UserHandler{repo: r, auth: NewAuth(secretKey)}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func badRequest(w http.ResponseWriter, msg string) {
	writeJSON(w, http.StatusBadRequest, map[string]string{"error": msg})
}

type registerReq struct {
	FullName string        `json:"fullName"`
	Email    string        `json:"email"`
	Password string        `json:"password"`
	Role     repo.UserRole `json:"role"`
}

type authResp struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		badRequest(w, "invalid JSON body")
		return
	}
	req.Email = strings.TrimSpace(req.Email)
	req.FullName = strings.TrimSpace(req.FullName)
	req.Password = strings.TrimSpace(req.Password)

	if req.FullName == "" || req.Email == "" || req.Password == "" {
		badRequest(w, "fullName, email and password are required")
		return
	}

	u := repo.User{
		FullName: req.FullName,
		Email:    req.Email,
		Password: req.Password,
		Role:     req.Role,
	}
	created, err := h.repo.Register(r.Context(), u)
	if err != nil {
		if errors.Is(err, repo.ErrEmailExists) {
			writeJSON(w, http.StatusConflict, map[string]string{"error":  err.Error()})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to register"})
		return
	}

	token, _, err := h.auth.GenerateToken(created.Email, string(created.Role), 24*time.Hour)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to issue token"})
		return
	}

	writeJSON(w, http.StatusCreated, authResp{
		Token: token,
		User: map[string]any{
			"id":       created.ID,
			"fullName": created.FullName,
			"email":    created.Email,
			"role":     created.Role,
		},
	})
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		badRequest(w, "invalid JSON body")
		return
	}
	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)
	if req.Email == "" || req.Password == "" {
		badRequest(w, "email and password are required")
		return
	}

	u, err := h.repo.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, repo.ErrInvalidCredentials) {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to login"})
		return
	}

	token, _, err := h.auth.GenerateToken(u.Email, string(u.Role), 24*time.Hour)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to issue token"})
		return
	}

	writeJSON(w, http.StatusOK, authResp{
		Token: token,
		User: map[string]any{
			"id":       u.ID,
			"fullName": u.FullName,
			"email":    u.Email,
			"role":     u.Role,
		},
	})
}

// GET /api/v1/auth/verify  (ili HEAD)
// Vraća 200 + { ok:true, email, role } ako je token validan; inače 401
func (h *UserHandler) Verify(w http.ResponseWriter, r *http.Request) {
	tokenString := parseBearerToken(r.Header.Get("Authorization"))
	if tokenString == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "missing bearer token"})
		return
	}

	tc, err := h.auth.VerifyToken(tokenString)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "invalid token"})
		return
	}

	if r.Method == http.MethodHead {
		w.WriteHeader(http.StatusNoContent) // 204
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"email": tc.Email,
		"role":  tc.Role,
	})
}

func (h *UserHandler) Authorize(w http.ResponseWriter, r *http.Request) {
	tokenString := parseBearerToken(r.Header.Get("Authorization"))
	if tokenString == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "missing bearer token"})
		return
	}

	tc, err := h.auth.VerifyToken(tokenString)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "invalid token"})
		return
	}

	q := r.URL.Query()
	roles := q["role"]
	if any := q.Get("any"); any != "" {
		for _, part := range strings.Split(any, ",") {
			if p := strings.TrimSpace(part); p != "" {
				roles = append(roles, p)
			}
		}
	}

	if len(roles) == 0 {
		writeJSON(w, http.StatusOK, map[string]any{
			"allowed": true,
			"email":   tc.Email,
			"role":    tc.Role,
		})
		return
	}

	userRole := strings.ToUpper(tc.Role)
	allowed := false
	for _, r := range roles {
		if strings.ToUpper(strings.TrimSpace(r)) == userRole {
			allowed = true
			break
		}
	}

	if !allowed {
		writeJSON(w, http.StatusForbidden, map[string]any{
			"allowed": false,
			"reason":  "insufficient role",
			"role":    tc.Role,
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"allowed": true,
		"email":   tc.Email,
		"role":    tc.Role,
	})
}

func parseBearerToken(header string) string {
	if header == "" {
		return ""
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 {
		return ""
	}
	if !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}
