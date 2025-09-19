package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

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

	role, _ := r.Context().Value("role").(string)

	if role != "employee" {
		http.Error(w, "only employees can create job", http.StatusForbidden)
		return
	}

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

	role, _ := r.Context().Value("role").(string)

	if role != "employee" {
		http.Error(w, "only employees can update job", http.StatusForbidden)
		return
	}

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

	role, _ := r.Context().Value("role").(string)

	if role != "employee" {
		http.Error(w, "only employees can delete job", http.StatusForbidden)
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

func (h *JobHandler) ApplyForJob(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "candidate" {
		http.Error(w, "only candidates can apply for job", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	idStr := vars["id"]
	candidateEmailStr := vars["email"]

	jobID, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid job id", http.StatusBadRequest)
		return
	}

	job, err := h.repo.GetByID(r.Context(), jobID)
	if err != nil {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}

	if job.RequiredFaculty != nil && *job.RequiredFaculty {
		client := &http.Client{Timeout: 5 * time.Second}
		req, err := http.NewRequest(
			"GET",
			fmt.Sprintf("http://university:8081/api/v1/university/students/verify-graduation"),
			nil,
		)
		if err != nil {
			http.Error(w, "failed to build request:", http.StatusNotFound)
			return
		}
		req.Header.Set("Content-Type", "application/json")
		if authHeader := r.Header.Get("Authorization"); authHeader != "" {
			req.Header.Set("Authorization", authHeader)
		}

		resp, err := client.Do(req)
		if err != nil {
			http.Error(w, "university service unreachable:", http.StatusNotFound)
			return
		}
		defer resp.Body.Close()

		// Čitamo cijeli body prvo
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			http.Error(w, "failed to read response body:", http.StatusNotFound)
			return
		}

		// Dekodiranje u mapu
		var stud map[string]interface{}
		if err := json.Unmarshal(body, &stud); err != nil {
			http.Error(w, "failed to decode student response:", http.StatusNotFound)
			return
		}

		// Provjera statusa
		graduated := false
		if status, ok := stud["status"].(string); ok && status == "GRADUATED" {
			graduated = true
		}

		// Sada graduated ima true/false
		if graduated {
			fmt.Println("Student je diplomirao!")
		} else {
			http.Error(w, "Verifikacija nije uspjesna - nemate diplomu", http.StatusNotFound)
		}
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

func (h *JobHandler) GetCandidatesForJob(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "employee" {
		http.Error(w, "only employees can get candidates for job", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	jobIDStr := vars["id"]
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		http.Error(w, "invalid job id", http.StatusBadRequest)
		return
	}

	indices, err := h.jobAppsRepo.GetStudentIndicesByJobID(r.Context(), jobID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if len(indices) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
		return
	}

	reqBody := map[string][]string{"indices": indices}
	body, _ := json.Marshal(reqBody)

	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest(
		"POST",
		"http://university:8081/api/v1/university/students/avg-grades",
		bytes.NewBuffer(body),
	)
	if err != nil {
		http.Error(w, "failed to build request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	if authHeader := r.Header.Get("Authorization"); authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "university service unreachable: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "university service returned error", resp.StatusCode)
		return
	}

	// forwarduj rezultat direktno
	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

// Delete jobapplication
func (h *JobHandler) DeleteJobApplication(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role == "employee" || role == "candidate" {
		http.Error(w, "only employees and candidates can delete job application", http.StatusForbidden)
		return
	}

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

	role, _ := r.Context().Value("role").(string)

	if role != "candidate" {
		http.Error(w, "only candidated can schedule interview", http.StatusForbidden)
		return
	}

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
	interview, err := h.interviewRepo.GetInterviewByCandidateIDAndByJobID(r.Context(), emp.JobID, candidate.ID)
	if err != nil {
		http.Error(w, "failed to check existing application: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Ako postoji već prijava, vrati conflict
	if interview != nil {
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

	role, _ := r.Context().Value("role").(string)

	if role != "employee" {
		http.Error(w, "only employees can delete interview", http.StatusForbidden)
		return
	}

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
