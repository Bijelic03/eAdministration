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

type CourseListResponse struct {
	Courses    []*repositories.Course `json:"courses"`
	Page       int                    `json:"page"`
	TotalItems int                    `json:"totalItems"`
	TotalPages int                    `json:"totalPages"`
	Error      interface{}            `json:"error"`
}

type CourseHandler struct {
	repo *repositories.CourseRepository
}

func NewCourseHandler(repo *repositories.CourseRepository) *CourseHandler {
	return &CourseHandler{repo: repo}
}

// Create course
func (h *CourseHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "facultyadmin" {
		http.Error(w, "only facultyadmi can create courses", http.StatusForbidden)
		return
	}

	var emp repositories.Course
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

// Get course by ID
func (h *CourseHandler) GetCourseByID(w http.ResponseWriter, r *http.Request) {
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

// Get all courses
func (h *CourseHandler) GetAllCourses(w http.ResponseWriter, r *http.Request) {
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

	courses, totalItems, err := h.repo.GetAll(r.Context(), page, limit)
	if err != nil {
		resp := CourseListResponse{
			Courses:    nil,
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

	resp := CourseListResponse{
		Courses:    courses,
		Page:       page,
		TotalItems: totalItems,
		TotalPages: totalPages,
		Error:      nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Update course
func (h *CourseHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "facultyadmin" {
		http.Error(w, "only facultyadmin can update courses", http.StatusForbidden)
		return
	}

	var emp repositories.Course
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

// Delete course
func (h *CourseHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "facultyadmin" {
		http.Error(w, "only facultyadmin can delete courses", http.StatusForbidden)
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
