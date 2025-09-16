package handlers

import (
	"net/http"

	"university/services"
)

type ProfessorHandler struct {
	service *services.ProfessorService
}

func (h *ProfessorHandler) EnterGrade(w http.ResponseWriter, r *http.Request) {
	// logika za uzimanje studentID, courseID i grade iz requesta
}
