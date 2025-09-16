package services

import "university/repositories"

type AlumniService struct {
	repo *repositories.AlumniRepository
}

func (s *AlumniService) GetGraduatedStudents() ([]string, error) {
	return s.repo.GetGraduatedStudents()
}
