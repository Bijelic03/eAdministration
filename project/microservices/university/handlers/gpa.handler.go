package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Bijelic03/eAdministration/project/microservices/university/services"
)

type GPAHandler struct {
	service *services.GPAService
}

func (h *GPAHandler) GetGPA(w http.ResponseWriter, r *http.Request) {
	studentID := r.URL.Query().Get("studentID")
	gpa, _ := h.service.GetGPA(studentID)
	json.NewEncoder(w).Encode(map[string]float64{"gpa": gpa})
}
