package services

import (
	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/repositories"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/model"
)

type CandidateService struct {
	repo *repositories.CandidateRepository
}

// =================== CRUD ===================

func (s *CandidateService) Create(candidate *model.Candidate) error {
	return s.repo.Create(candidate)
}

func (s *CandidateService) GetAll() ([]model.Candidate, error) {
	return s.repo.GetAll()
}

func (s *CandidateService) GetByID(id string) (*model.Candidate, error) {
	return s.repo.GetByID(id)
}

func (s *CandidateService) Update(candidate *model.Candidate) error {
	return s.repo.Update(candidate)
}

func (s *CandidateService) Delete(id string) error {
	return s.repo.Delete(id)
}

// =============== DODATNE FUNKCIJE ===============

func (s *CandidateService) Apply(candidateID string, jobID string) error {
	return s.repo.SaveApplication(candidateID, jobID)
}

func (s *CandidateService) VerifyEducation(candidateID string) (bool, error) {
	return s.repo.CheckEducation(candidateID)
}
