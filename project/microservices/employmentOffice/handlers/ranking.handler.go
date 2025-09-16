package handlers

import (
	"net/http"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/services"
)

type RankingHandler struct {
	service *services.RankingService
}

// HTTP endpoint za rangiranje kandidata
func (h *RankingHandler) RankCandidates(w http.ResponseWriter, r *http.Request) {
	// poziva service.RankCandidates(jobID)
}
