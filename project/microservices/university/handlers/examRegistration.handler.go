package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Bijelic03/eAdministration/project/microservices/university/repositories"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ExamRegistrationHandler struct {
	repo *repositories.ExamRegistrationRepository
}

func NewExamRegistrationHandler(repo *repositories.ExamRegistrationRepository) *ExamRegistrationHandler {
	return &ExamRegistrationHandler{repo: repo}
}

// Register student for exam
func (h *ExamRegistrationHandler) RegisterExam(w http.ResponseWriter, r *http.Request) {
	// email i role dolaze iz authMiddleware
	email, _ := r.Context().Value("email").(string)
	role, _ := r.Context().Value("role").(string)

	if email == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if role != "student" {
		http.Error(w, "only students can register for exams", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	examIDStr := vars["id"]
	examID, err := uuid.Parse(examIDStr)
	if err != nil {
		http.Error(w, "invalid exam id", http.StatusBadRequest)
		return
	}

	reg, err := h.repo.Register(r.Context(), examID, email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reg)
}

// Get all registrations for student
func (h *ExamRegistrationHandler) GetMyRegistrations(w http.ResponseWriter, r *http.Request) {
	email, _ := r.Context().Value("email").(string)
	role, _ := r.Context().Value("role").(string)

	if email == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if role != "student" {
		http.Error(w, "only students can view their registrations", http.StatusForbidden)
		return
	}

	registrations, err := h.repo.GetByStudentEmail(r.Context(), email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(registrations)
}

func (h *ExamRegistrationHandler) EnterGrade(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	if role != "professor" {
		http.Error(w, "only professors can enter grades", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	examIDStr := vars["id"]
	examID, err := uuid.Parse(examIDStr)
	if err != nil {
		http.Error(w, "invalid exam id", http.StatusBadRequest)
		return
	}

	var req struct {
		StudentID string `json:"studentid"`
		Grade     int    `json:"grade"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	studentID, err := uuid.Parse(req.StudentID)
	if err != nil {
		http.Error(w, "invalid student id", http.StatusBadRequest)
		return
	}

	reg, err := h.repo.EnterGrade(r.Context(), examID, studentID, req.Grade)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reg)
}
