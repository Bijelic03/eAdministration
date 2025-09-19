package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Bijelic03/eAdministration/project/microservices/university/repositories"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type CourseRegistrationHandler struct {
	repo     *repositories.CourseRegistrationRepository
	studRepo *repositories.StudentRepository
}

func NewCourseRegistrationHandler(repo *repositories.CourseRegistrationRepository, studRepo *repositories.StudentRepository) *CourseRegistrationHandler {
	return &CourseRegistrationHandler{repo: repo, studRepo: studRepo}
}

// Register student for course
func (h *CourseRegistrationHandler) RegisterCourse(w http.ResponseWriter, r *http.Request) {
	email, _ := r.Context().Value("email").(string)
	role, _ := r.Context().Value("role").(string)

	if email == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if role != "student" {
		http.Error(w, "only students can register for courses", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	courseIDStr := vars["id"]
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		http.Error(w, "invalid course id", http.StatusBadRequest)
		return
	}

	// prvo dohvatimo studenta iz emaila
	stud, err := h.studRepo.GetByEmail(r.Context(), email)
	if err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	studentID := stud.ID

	// PROVERA: da li je student vec registrovan za ovaj course
	existing, err := h.repo.GetByStudentIDAndCourseID(r.Context(), studentID, courseID)
	if err != nil {
		http.Error(w, "error checking existing registration", http.StatusInternalServerError)
		return
	}
	if existing != nil {
		http.Error(w, "vec ste prijavljeni za ovaj kurs", http.StatusConflict)
		return
	}

	reg, err := h.repo.Register(r.Context(), courseID, email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reg)
}

// Get all course registrations for student
func (h *CourseRegistrationHandler) GetMyCourseRegistrations(w http.ResponseWriter, r *http.Request) {
	email, _ := r.Context().Value("email").(string)
	role, _ := r.Context().Value("role").(string)

	if email == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if role != "student" {
		http.Error(w, "only students can view their course registrations", http.StatusForbidden)
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
