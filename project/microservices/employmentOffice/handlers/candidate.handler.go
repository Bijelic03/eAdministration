package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/model"
	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/services"
	"github.com/gorilla/mux"
)

type CandidateHandler struct {
	Service *services.CandidateService
}

// =================== CRUD ===================

func (h *CandidateHandler) Create(w http.ResponseWriter, r *http.Request) {
	var candidate model.Candidate
	if err := json.NewDecoder(r.Body).Decode(&candidate); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if err := h.Service.Create(&candidate); err != nil {
		http.Error(w, "Failed to create candidate", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(candidate)
}

func (h *CandidateHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	candidates, err := h.Service.GetAll()
	if err != nil {
		http.Error(w, "Failed to fetch candidates", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(candidates)
}

func (h *CandidateHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	candidate, err := h.Service.GetByID(id)
	if err != nil {
		http.Error(w, "Candidate not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(candidate)
}

func (h *CandidateHandler) Update(w http.ResponseWriter, r *http.Request) {
	var candidate model.Candidate
	if err := json.NewDecoder(r.Body).Decode(&candidate); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if err := h.Service.Update(&candidate); err != nil {
		http.Error(w, "Failed to update candidate", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(candidate)
}

func (h *CandidateHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	if err := h.Service.Delete(id); err != nil {
		http.Error(w, "Failed to delete candidate", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// =============== DODATNE FUNKCIJE ===============

func (h *CandidateHandler) Apply(w http.ResponseWriter, r *http.Request) {
	candidateID := r.URL.Query().Get("candidateID")
	jobID := r.URL.Query().Get("jobID")

	if err := h.Service.Apply(candidateID, jobID); err != nil {
		http.Error(w, "Failed to apply", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *CandidateHandler) VerifyEducation(w http.ResponseWriter, r *http.Request) {
	candidateID := r.URL.Query().Get("candidateID")

	verified, err := h.Service.VerifyEducation(candidateID)
	if err != nil {
		http.Error(w, "Verification failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]bool{"verified": verified})
}
