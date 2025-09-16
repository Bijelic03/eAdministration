package services

import "github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/repositories"

type JobService struct {
	repo *repositories.JobRepository
}

// Objava ponude
func (s *JobService) CreateJob(jobData interface{}) error {
	return s.repo.SaveJob(jobData)
}

// Zakazivanje intervjua
func (s *JobService) ScheduleInterview(jobID string, candidateID string, datetime string) error {
	return s.repo.SaveInterview(jobID, candidateID, datetime)
}

// Dohvat kandidata za rangiranje
func (s *JobService) GetCandidates(jobID string) ([]string, error) {
	return s.repo.GetCandidates(jobID)
}
