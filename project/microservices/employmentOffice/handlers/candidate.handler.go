package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/services"
)

type CandidateHandler struct {
	service *services.CandidateService
}

// Prijava kandidata na ponudu
func (h *CandidateHandler) Apply(w http.ResponseWriter, r *http.Request) {
	candidateID := r.URL.Query().Get("candidateID")
	jobID := r.URL.Query().Get("jobID")
	h.service.Apply(candidateID, jobID)
	w.WriteHeader(http.StatusOK)
}

// Verifikacija obrazovanja kandidata
func (h *CandidateHandler) VerifyEducation(w http.ResponseWriter, r *http.Request) {
	candidateID := r.URL.Query().Get("candidateID")
	verified, _ := h.service.VerifyEducation(candidateID)
	json.NewEncoder(w).Encode(map[string]bool{"verified": verified})
}
