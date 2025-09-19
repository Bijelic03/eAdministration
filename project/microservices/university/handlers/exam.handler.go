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

type ExamListResponse struct {
	Exams      []*repositories.Exam `json:"exams"`
	Page       int                  `json:"page"`
	TotalItems int                  `json:"totalItems"`
	TotalPages int                  `json:"totalPages"`
	Error      interface{}          `json:"error"`
}

type ExamHandler struct {
	repo       *repositories.ExamRepository
	courseRepo *repositories.CourseRepository
	profRepo   *repositories.ProfessorRepository
}

func NewExamHandler(repo *repositories.ExamRepository, courseRepo *repositories.CourseRepository, profRepo *repositories.ProfessorRepository) *ExamHandler {
	return &ExamHandler{repo: repo, courseRepo: courseRepo, profRepo: profRepo}
}

// Create exam
func (h *ExamHandler) CreateExam(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "professor" {
		http.Error(w, "only professors can create exams", http.StatusForbidden)
		return
	}

	var exam repositories.Exam
	if err := json.NewDecoder(r.Body).Decode(&exam); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Parsiranje CourseID
	courseUUID, err := uuid.Parse(exam.CourseID)
	if err != nil {
		http.Error(w, "invalid course id", http.StatusBadRequest)
		return
	}

	// Parsiranje ProfessorID
	profUUID, err := uuid.Parse(exam.ProfessorID)
	if err != nil {
		http.Error(w, "invalid professor id", http.StatusBadRequest)
		return
	}

	// PROVERA: validan courseID
	courseExists, err := h.courseRepo.GetByID(r.Context(), courseUUID)
	if err != nil {
		http.Error(w, "error checking course", http.StatusInternalServerError)
		return
	}
	if courseExists == nil {
		http.Error(w, "course not found", http.StatusBadRequest)
		return
	}

	// PROVERA: validan professorID
	profExists, err := h.profRepo.GetByID(r.Context(), profUUID)
	if err != nil {
		http.Error(w, "error checking professor", http.StatusInternalServerError)
		return
	}
	if profExists == nil {
		http.Error(w, "professor not found", http.StatusBadRequest)
		return
	}

	created, err := h.repo.Add(r.Context(), &exam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(created)
}

// Get exam by ID
func (h *ExamHandler) GetExamByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	exam, err := h.repo.GetByID(context.Background(), id)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exam)
}

// Get all exams
func (h *ExamHandler) GetAllExams(w http.ResponseWriter, r *http.Request) {
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

	exams, totalItems, err := h.repo.GetAll(r.Context(), page, limit)
	if err != nil {
		resp := ExamListResponse{
			Exams:      nil,
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

	resp := ExamListResponse{
		Exams:      exams,
		Page:       page,
		TotalItems: totalItems,
		TotalPages: totalPages,
		Error:      nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Update exam
func (h *ExamHandler) UpdateExam(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "professor" {
		http.Error(w, "only professors can update exams", http.StatusForbidden)
		return
	}

	var exam repositories.Exam
	if err := json.NewDecoder(r.Body).Decode(&exam); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	updated, err := h.repo.Update(r.Context(), &exam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

// Delete exam
func (h *ExamHandler) DeleteExam(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "professor" {
		http.Error(w, "only professors can delete exams", http.StatusForbidden)
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
