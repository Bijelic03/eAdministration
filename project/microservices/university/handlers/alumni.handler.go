package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Bijelic03/eAdministration/project/microservices/university/services"
)

type AlumniHandler struct {
	service *services.AlumniService
}

func (h *AlumniHandler) GetGraduatedStudents(w http.ResponseWriter, r *http.Request) {
	students, _ := h.service.GetGraduatedStudents()
	json.NewEncoder(w).Encode(students)
}
