package handlers

import (
	"encoding/json"
	"net/http"

	"employmentOffice/services"
)

type JobHandler struct {
	service *services.JobService
}

// Objava ponude za posao/praksu
func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	// logika za dohvat jobData iz requesta
	h.service.CreateJob(nil)
	w.WriteHeader(http.StatusOK)
}

// Zakazivanje intervjua
func (h *JobHandler) ScheduleInterview(w http.ResponseWriter, r *http.Request) {
	// logika za dohvat jobID, candidateID, datetime
	h.service.ScheduleInterview("jobID", "candidateID", "datetime")
	w.WriteHeader(http.StatusOK)
}

// Dohvat kandidata za rangiranje
func (h *JobHandler) GetCandidates(w http.ResponseWriter, r *http.Request) {
	candidates, _ := h.service.GetCandidates("jobID")
	json.NewEncoder(w).Encode(candidates)
}
