package handlers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/repositories"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type EmployeeListResponse struct {
	Employees  []*repositories.Employee `json:"employees"`
	Page       int                      `json:"page"`
	TotalItems int                      `json:"totalItems"`
	TotalPages int                      `json:"totalPages"`
	Error      interface{}              `json:"error"`
}

type EmployeeHandler struct {
	repo *repositories.EmployeeRepository
}

func NewEmployeeHandler(repo *repositories.EmployeeRepository) *EmployeeHandler {
	return &EmployeeHandler{repo: repo}
}

// Create employee
func (h *EmployeeHandler) CreateEmployee(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "sszadmin" {
		http.Error(w, "only sszadmin can create employee", http.StatusForbidden)
		return
	}

	var emp repositories.Employee
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

// Get employee by ID
func (h *EmployeeHandler) GetEmployeeByID(w http.ResponseWriter, r *http.Request) {
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

// Get employee by email (JSON body)
func (h *EmployeeHandler) GetEmployeeByEmail(w http.ResponseWriter, r *http.Request) {
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

	emp, err := h.repo.GetByEmail(r.Context(), req.Email)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(emp)
}

// Get all employees
func (h *EmployeeHandler) GetAllEmployees(w http.ResponseWriter, r *http.Request) {
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

	role, _ := r.Context().Value("role").(string)
	email, _ := r.Context().Value("email").(string)

	var emp *repositories.Employee

    if role == "employee" {
        var err error
        emp, err = h.repo.GetByEmail(r.Context(), email)
        if err != nil {
            http.Error(w, "not found", http.StatusNotFound)
            return
        }

		employees, totalItems, err := h.repo.GetAllByJobId(r.Context(), page, limit, *emp.JobID)
		if err != nil {
			resp := EmployeeListResponse{
				Employees:  nil,
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
	
		resp := EmployeeListResponse{
			Employees:  employees,
			Page:       page,
			TotalItems: totalItems,
			TotalPages: totalPages,
			Error:      nil,
		}
	
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
    } else {
		employees, totalItems, err := h.repo.GetAll(r.Context(), page, limit)
		if err != nil {
			resp := EmployeeListResponse{
				Employees:  nil,
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
	
		resp := EmployeeListResponse{
			Employees:  employees,
			Page:       page,
			TotalItems: totalItems,
			TotalPages: totalPages,
			Error:      nil,
		}
	
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
	
}



// get all pofesors
func (h *EmployeeHandler) GetAllProfessorsFromOtherService(w http.ResponseWriter, r *http.Request) {
	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest(
		"GET",
		"http://university:8081/api/v1/university/professors",
		nil,
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

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

// Update employee
func (h *EmployeeHandler) UpdateEmployee(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "employee" && role != "sszadmin"  {
		http.Error(w, "only sszadmin and employees can update employees", http.StatusForbidden)
		return
	}

	var emp repositories.Employee
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

// Delete employee
func (h *EmployeeHandler) DeleteEmployee(w http.ResponseWriter, r *http.Request) {

	role, _ := r.Context().Value("role").(string)

	if role != "sszadmin" {
		http.Error(w, "only sszadmin can delete employees", http.StatusForbidden)
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


// Delete employee
func (h *EmployeeHandler) QuitJob(w http.ResponseWriter, r *http.Request) {

	email, _ := r.Context().Value("email").(string)

    _, err := h.repo.GetByEmail(r.Context(), email)
    if err != nil {
        http.Error(w, "not found", http.StatusNotFound)
        return
    }

	if err := h.repo.QuitJob(r.Context(), email); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
