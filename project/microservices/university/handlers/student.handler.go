package handlers

import (
	"net/http"

	"github.com/Bijelic03/eAdministration/project/microservices/university/services"
)

type StudentHandler struct {
	service *services.StudentService
}

func (h *StudentHandler) RegisterExam(w http.ResponseWriter, r *http.Request) {
	// logika za uzimanje studentID i examID iz requesta
}

func (h *StudentHandler) EnrollCourse(w http.ResponseWriter, r *http.Request) {
	// logika za uzimanje studentID i courseID iz requesta
}
