// package handlers

// import (
// 	"net/http"

// 	"university/services"
// )

// type StudentHandler struct {
// 	service *services.StudentService
// }

// func (h *StudentHandler) RegisterExam(w http.ResponseWriter, r *http.Request) {
// 	// logika za uzimanje studentID i examID iz requesta
// }

// func (h *StudentHandler) EnrollCourse(w http.ResponseWriter, r *http.Request) {
// 	// logika za uzimanje studentID i courseID iz requesta
// }

// package handlers

// import (
// 	"net/http"

// 	"university/services"
// )

// type ProfessorHandler struct {
// 	service *services.ProfessorService
// }

// func (h *ProfessorHandler) EnterGrade(w http.ResponseWriter, r *http.Request) {
// 	// logika za uzimanje studentID, courseID i grade iz requesta
// }

package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/Bijelic03/eAdministration/project/microservices/university/repositories"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type StudentListResponse struct {
	Students   []*repositories.Student `json:"students"`
	Page       int                     `json:"page"`
	TotalItems int                     `json:"totalItems"`
	TotalPages int                     `json:"totalPages"`
	Error      interface{}             `json:"error"`
}

type StudentHandler struct {
	repo *repositories.StudentRepository
}

func NewStudentHandler(repo *repositories.StudentRepository) *StudentHandler {
	return &StudentHandler{repo: repo}
}

// Create Student
func (h *StudentHandler) CreateStudent(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "facultyadmin" {
		http.Error(w, "only facultyadmin can create student", http.StatusForbidden)
		return
	}

	var stud repositories.Student
	if err := json.NewDecoder(r.Body).Decode(&stud); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.repo.Add(r.Context(), &stud)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(created)
}

// Get student by ID
func (h *StudentHandler) GetStudentByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	stud, err := h.repo.GetByID(context.Background(), id)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stud)
}

// GetAllIndexNumbersHandler vraća sve postojeće index brojeve studenata
func (h *StudentHandler) GetAllIndexNumbersHandler(w http.ResponseWriter, r *http.Request) {
	indices, err := h.repo.GetAllIndexNumbers(r.Context())
	if err != nil {
		http.Error(w, "failed to fetch index numbers: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string][]string{
		"indices": indices,
	})
}

// Get student by email (JSON body)
func (h *StudentHandler) GetStudentByEmail(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if req.Email == "" {
		http.Error(w, "email is required", http.StatusBadRequest)
		return
	}

	stud, err := h.repo.GetByEmail(r.Context(), req.Email)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stud)
}

// verify graduation check
func (h *StudentHandler) VerifyGraduation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	indexno := vars["indexno"]

	stud, err := h.repo.GetByIndexNo(r.Context(), indexno)
	if err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	graduated := stud.Status != nil && *stud.Status == "GRADUATED"

	response := map[string]interface{}{
		"student": stud,
		"status":  graduated,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

// Get all students
func (h *StudentHandler) GetAllStudents(w http.ResponseWriter, r *http.Request) {
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

	students, totalItems, err := h.repo.GetAll(r.Context(), page, limit)
	if err != nil {
		resp := StudentListResponse{
			Students:   nil,
			Page:       page,
			TotalItems: 0,
			TotalPages: 0,
			Error:      err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	client := &http.Client{Timeout: 3 * time.Second}
	for _, s := range students {
		if s.IndexNo == nil || *s.IndexNo == "" {
			s.Employed = false
			continue
		}

		url := "http://employment-office:8082/api/v1/employmentOffice/employees/employed/" + *s.IndexNo
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			s.Employed = false
			continue
		}

		if authHeader := r.Header.Get("Authorization"); authHeader != "" {
			req.Header.Set("Authorization", authHeader)
		}

		respEmp, err := client.Do(req)
		if err != nil || respEmp.StatusCode != http.StatusOK {
			s.Employed = false
			continue
		}
		defer respEmp.Body.Close()

		var employedResp struct {
			IndexNo  string `json:"indexno"`
			Employed bool   `json:"employed"`
		}
		if err := json.NewDecoder(respEmp.Body).Decode(&employedResp); err != nil {
			s.Employed = false
			continue
		}
		log.Println(employedResp.IndexNo, " zaopslen:", employedResp.Employed)

		s.Employed = employedResp.Employed
	}

	totalPages := (totalItems + limit - 1) / limit

	resp := StudentListResponse{
		Students:   students,
		Page:       page,
		TotalItems: totalItems,
		TotalPages: totalPages,
		Error:      nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Update student
func (h *StudentHandler) UpdateStudent(w http.ResponseWriter, r *http.Request) {
	var stud repositories.Student
	if err := json.NewDecoder(r.Body).Decode(&stud); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	updated, err := h.repo.Update(r.Context(), &stud)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

// Delete student
func (h *StudentHandler) DeleteStudent(w http.ResponseWriter, r *http.Request) {
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

// Get students by indices with avg grade
func (h *StudentHandler) GetStudentsByIndicesWithAvg(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Indices []string `json:"indices"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if len(req.Indices) == 0 {
		http.Error(w, "indices are required", http.StatusBadRequest)
		return
	}

	students, err := h.repo.GetStudentsByIndexWithAvgGrade(r.Context(), req.Indices)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(students)
}
