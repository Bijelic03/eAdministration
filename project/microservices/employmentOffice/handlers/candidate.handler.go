package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"io"
	"time"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/repositories"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type CandidateListResponse struct {
	Candidates []*repositories.Candidate `json:"candidates"`
	Page       int                       `json:"page"`
	TotalItems int                       `json:"totalItems"`
	TotalPages int                       `json:"totalPages"`
	Error      interface{}               `json:"error"`
}

type CandidateHandler struct {
	repo *repositories.CandidateRepository
}

func NewCandidateHandler(repo *repositories.CandidateRepository) *CandidateHandler {
	return &CandidateHandler{repo: repo}
}

// Create candidate
func (h *CandidateHandler) CreateCandidate(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "sszadmin" {
		http.Error(w, "only sszadmin can create candidates", http.StatusForbidden)
		return
	}

	var emp repositories.Candidate
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

// Get candidate by ID
func (h *CandidateHandler) GetCandidateByID(w http.ResponseWriter, r *http.Request) {
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

// Get candidate by email (JSON body)
func (h *CandidateHandler) GetCandidateByEmail(w http.ResponseWriter, r *http.Request) {
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

// GetIndexAll poziva students servis da dobije sve index brojeve koji nisu kandidati ili zaposleni
func (h *CandidateHandler) GetIndexAll(w http.ResponseWriter, r *http.Request) {
	client := &http.Client{Timeout: 5 * time.Second}

	req, err := http.NewRequest(
		"GET",
		"http://university:8081/api/v1/university/students/get/indexno/all",
		nil,
	)
	if err != nil {
		http.Error(w, "failed to build request", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Content-Type", "application/json")

	// Prosleđivanje Authorization header-a ako postoji
	if authHeader := r.Header.Get("Authorization"); authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "students service unreachable: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "students service returned error", resp.StatusCode)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}


// Get all candidates
func (h *CandidateHandler) GetAllCandidates(w http.ResponseWriter, r *http.Request) {
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

	candidates, totalItems, err := h.repo.GetAll(r.Context(), page, limit)
	if err != nil {
		resp := CandidateListResponse{
			Candidates: nil,
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

	resp := CandidateListResponse{
		Candidates: candidates,
		Page:       page,
		TotalItems: totalItems,
		TotalPages: totalPages,
		Error:      nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Update candidate
func (h *CandidateHandler) UpdateCandidate(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "sszadmin" && role != "candidate" {
		http.Error(w, "only sszadmin and candidates can update candidate", http.StatusForbidden)
		return
	}

	var emp repositories.Candidate
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

// Delete candidate
func (h *CandidateHandler) DeleteCandidate(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "sszadmin" {
		http.Error(w, "only sszadmin can delete candidate", http.StatusForbidden)
		return
	}

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
