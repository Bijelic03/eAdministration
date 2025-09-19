// package handlers

// import (
// 	"net/http"

// 	"university/services"
// )

// type ProfessorHandler struct {
// 	service *services.ProfessorService
// }

// func (h *ProfessorHandler) EnterGrade(w http.ResponseWriter, r *http.Request) {
// 	// logika za uzimanje studentID, courseID i grade iz requesta
// }

package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Bijelic03/eAdministration/project/microservices/university/repositories"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ProfessorListResponse struct {
	Professors []*repositories.Professor `json:"professors"`
	Page       int                       `json:"page"`
	TotalItems int                       `json:"totalItems"`
	TotalPages int                       `json:"totalPages"`
	Error      interface{}               `json:"error"`
}

type ProfessorHandler struct {
	repo *repositories.ProfessorRepository
}

func NewProfessorHandler(repo *repositories.ProfessorRepository) *ProfessorHandler {
	return &ProfessorHandler{repo: repo}
}

// Create professor
func (h *ProfessorHandler) CreateProfessor(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "professor" {
		http.Error(w, "only professors can create professor", http.StatusForbidden)
		return
	}

	var emp repositories.Professor
	if err := json.NewDecoder(r.Body).Decode(&emp); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.repo.Add(r.Context(), &emp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(created)
}

// Get professor by ID
func (h *ProfessorHandler) GetProfessorByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	emp, err := h.repo.GetByID(context.Background(), id)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(emp)
}

// Get professor by email (JSON body)
func (h *ProfessorHandler) GetProfessorByEmail(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if req.Email == "" {
		http.Error(w, "email is required", http.StatusBadRequest)
		return
	}

	emp, err := h.repo.GetByEmail(r.Context(), req.Email)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(emp)
}

// Get all professors
func (h *ProfessorHandler) GetAllProfessors(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("max")

	page := 1
	limit := 10

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	professors, totalItems, err := h.repo.GetAll(r.Context(), page, limit)
	if err != nil {
		resp := ProfessorListResponse{
			Professors: nil,
			Page:       page,
			TotalItems: 0,
			TotalPages: 0,
			Error:      err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	totalPages := (totalItems + limit - 1) / limit

	resp := ProfessorListResponse{
		Professors: professors,
		Page:       page,
		TotalItems: totalItems,
		TotalPages: totalPages,
		Error:      nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Update professor
func (h *ProfessorHandler) UpdateProfessor(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "professor" {
		http.Error(w, "only professors can update professor", http.StatusForbidden)
		return
	}

	var emp repositories.Professor
	if err := json.NewDecoder(r.Body).Decode(&emp); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	updated, err := h.repo.Update(r.Context(), &emp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

// Delete professor
func (h *ProfessorHandler) DeleteProfessor(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := h.repo.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
