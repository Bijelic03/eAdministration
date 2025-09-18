package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/repositories"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type JobListResponse struct {
	Jobs       []*repositories.Job `json:"jobs"`
	Page       int                 `json:"page"`
	TotalItems int                 `json:"totalItems"`
	TotalPages int                 `json:"totalPages"`
	Error      interface{}         `json:"error"`
}

type JobApplicationsListResponse struct {
	JobApplications []*repositories.JobApplication `json:"jobapplications"`
	Page            int                            `json:"page"`
	TotalItems      int                            `json:"totalItems"`
	TotalPages      int                            `json:"totalPages"`
	Error           interface{}                    `json:"error"`
}

type InterviewsListResponse struct {
	Interviews []*repositories.Interview `json:"interviews"`
	Page       int                       `json:"page"`
	TotalItems int                       `json:"totalItems"`
	TotalPages int                       `json:"totalPages"`
	Error      interface{}               `json:"error"`
}
type JobHandler struct {
	repo          *repositories.JobRepository
	jobAppsRepo   *repositories.JobApplicationRepository
	candidateRepo *repositories.CandidateRepository
	interviewRepo *repositories.InterviewRepository
}

func NewJobHandler(repo *repositories.JobRepository, jobAppsRepo *repositories.JobApplicationRepository, candidateRepo *repositories.CandidateRepository, interviewRepo *repositories.InterviewRepository) *JobHandler {
	return &JobHandler{repo: repo, jobAppsRepo: jobAppsRepo, candidateRepo: candidateRepo, interviewRepo: interviewRepo}
}

// Create job
func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	var emp repositories.Job
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

// Get job by ID
func (h *JobHandler) GetJobByID(w http.ResponseWriter, r *http.Request) {
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

// Get all jobs
func (h *JobHandler) GetAllJobs(w http.ResponseWriter, r *http.Request) {
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

	jobs, totalItems, err := h.repo.GetAll(r.Context(), page, limit)
	if err != nil {
		resp := JobListResponse{
			Jobs:       nil,
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

	resp := JobListResponse{
		Jobs:       jobs,
		Page:       page,
		TotalItems: totalItems,
		TotalPages: totalPages,
		Error:      nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Update job
func (h *JobHandler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	var emp repositories.Job
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

// Delete job
func (h *JobHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
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

func (h *JobHandler) ApplyForJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	candidateEmailStr := vars["email"]

	jobID, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid job id", http.StatusBadRequest)
		return
	}

	candidate, err := h.candidateRepo.GetByEmail(r.Context(), candidateEmailStr)
	if err != nil {
		http.Error(w, "candidate not found", http.StatusNotFound)
		return
	}

	existing, err := h.jobAppsRepo.GetJobApplicationByCandidateIDAndByJobID(r.Context(), jobID, candidate.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if existing != nil {
		http.Error(w, "already applied for this job", http.StatusConflict)
		return
	}

	app := repositories.JobApplication{
		JobID:       jobID,
		CandidateID: candidate.ID,
	}

	created, err := h.jobAppsRepo.ApplyForJob(r.Context(), &app)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(created)
}

// Get all jobapplications
func (h *JobHandler) GetAllJobApplications(w http.ResponseWriter, r *http.Request) {
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

	jobs, totalItems, err := h.jobAppsRepo.GetAllJobApplications(r.Context(), page, limit)
	if err != nil {
		resp := JobApplicationsListResponse{
			JobApplications: nil,
			Page:            page,
			TotalItems:      0,
			TotalPages:      0,
			Error:           err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	totalPages := (totalItems + limit - 1) / limit

	resp := JobApplicationsListResponse{
		JobApplications: jobs,
		Page:            page,
		TotalItems:      totalItems,
		TotalPages:      totalPages,
		Error:           nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Delete jobapplication
func (h *JobHandler) DeleteJobApplication(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := h.jobAppsRepo.DeleteJobApplication(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Schedule interview
func (h *JobHandler) ScheduleInterview(w http.ResponseWriter, r *http.Request) {
	var emp repositories.Interview
	if err := json.NewDecoder(r.Body).Decode(&emp); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Provjeri da li kandidat postoji
	candidate, err := h.candidateRepo.GetByID(r.Context(), emp.CandidateID)
	if err != nil {
		http.Error(w, "candidate not found", http.StatusNotFound)
		return
	}

	// Provjeri da li kandidat već ima prijavu za ovaj posao
	jobapp, err := h.jobAppsRepo.GetJobApplicationByCandidateIDAndByJobID(r.Context(), emp.JobID, candidate.ID)
	if err != nil {
		http.Error(w, "failed to check existing application: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Ako postoji već prijava, vrati conflict
	if jobapp != nil {
		http.Error(w, "candidate already applied for this job", http.StatusConflict)
		return
	}
	created, err := h.interviewRepo.ScheduleInterview(r.Context(), &emp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(created)
}

// Get all interviews
func (h *JobHandler) GetAllInterviews(w http.ResponseWriter, r *http.Request) {
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

	ints, totalItems, err := h.interviewRepo.GetAllInterviews(r.Context(), page, limit)
	if err != nil {
		resp := JobApplicationsListResponse{
			JobApplications: nil,
			Page:            page,
			TotalItems:      0,
			TotalPages:      0,
			Error:           err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	totalPages := (totalItems + limit - 1) / limit

	resp := InterviewsListResponse{
		Interviews: ints,
		Page:       page,
		TotalItems: totalItems,
		TotalPages: totalPages,
		Error:      nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Delete interview
func (h *JobHandler) DeleteInterview(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := h.interviewRepo.DeleteInterview(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
