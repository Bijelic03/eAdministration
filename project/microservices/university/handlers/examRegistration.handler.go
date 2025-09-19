package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Bijelic03/eAdministration/project/microservices/university/repositories"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ExamRegistrationHandler struct {
	repo        *repositories.ExamRegistrationRepository
	studentRepo *repositories.StudentRepository
	coursesRepo *repositories.CourseRegistrationRepository
	examRepo    *repositories.ExamRepository
}

func NewExamRegistrationHandler(repo *repositories.ExamRegistrationRepository, studentRepo *repositories.StudentRepository, coursesRepo *repositories.CourseRegistrationRepository,
	examRepo *repositories.ExamRepository) *ExamRegistrationHandler {
	return &ExamRegistrationHandler{repo: repo, studentRepo: studentRepo, coursesRepo: coursesRepo, examRepo: examRepo}
}

// Register student for exam
func (h *ExamRegistrationHandler) RegisterExam(w http.ResponseWriter, r *http.Request) {

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

	exam, err := h.examRepo.GetByID(r.Context(), examID)
	if err != nil {
		http.Error(w, "exam not found", http.StatusNotFound)
		return
	}

	stud, err := h.studentRepo.GetByEmail(r.Context(), email)
	if err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	studentID := stud.ID
	kursID, err := uuid.Parse(exam.CourseID)
	if err != nil {
		http.Error(w, "invalid course id", http.StatusBadRequest)
		return
	}

	coursesReg, err := h.coursesRepo.GetByStudentIDAndCourseID(r.Context(), studentID, kursID)
	if err != nil {
		http.Error(w, "Greška prilikom provjere course registration:", http.StatusNotFound)
		return
	}

	if coursesReg == nil {
		http.Error(w, "Student nije registrovan na ovaj kurs:", http.StatusNotFound)
		return
	}

	existing, err := h.repo.GetByStudentIDAndExamID(r.Context(), studentID, examID)
	if err != nil {
		http.Error(w, "error checking existing registration", http.StatusInternalServerError)
		return
	}
	if existing != nil {
		http.Error(w, "vec ste prijavljeni za ovaj ispit", http.StatusConflict)
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

// Get examregistrations for profesr
func (h *ExamRegistrationHandler) GetExamRegistrations(w http.ResponseWriter, r *http.Request) {
	email, _ := r.Context().Value("email").(string)
	role, _ := r.Context().Value("role").(string)

	if email == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if role != "professor" {
		http.Error(w, "only professors can view their examregistrations", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	examIDStr := vars["id"]
	examID, err := uuid.Parse(examIDStr)
	if err != nil {
		http.Error(w, "invalid exam id", http.StatusBadRequest)
		return
	}

	registrations, err := h.repo.GetByExamID(r.Context(), examID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(registrations)
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
		StudentID string      `json:"studentid"`
		Grade     interface{} `json:"grade"`
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

	var grade int
	switch v := req.Grade.(type) {
	case float64:
		grade = int(v)
	case string:
		g, err := strconv.Atoi(v)
		if err != nil {
			http.Error(w, "grade must be a number", http.StatusBadRequest)
			return
		}
		grade = g
	default:
		http.Error(w, "grade must be a number", http.StatusBadRequest)
		return
	}

	if grade < 1 || grade > 10 {
		http.Error(w, "grade must be between 1 and 10", http.StatusBadRequest)
		return
	}

	reg, err := h.repo.EnterGrade(r.Context(), examID, studentID, grade)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reg)
}
