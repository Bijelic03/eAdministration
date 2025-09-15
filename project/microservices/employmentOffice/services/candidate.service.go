package services

import "github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/repositories"

type CandidateService struct {
	repo *repositories.CandidateRepository
}

// Kandidat se prijavljuje na ponudu
func (s *CandidateService) Apply(candidateID string, jobID string) error {
	return s.repo.SaveApplication(candidateID, jobID)
}

// Verifikacija obrazovanja kandidata
func (s *CandidateService) VerifyEducation(candidateID string) (bool, error) {
	return s.repo.CheckEducation(candidateID)
}
