package services

import "github.com/Bijelic03/eAdministration/project/microservices/university/repositories"

type AlumniService struct {
	repo *repositories.AlumniRepository
}

func (s *AlumniService) GetGraduatedStudents() ([]string, error) {
	return s.repo.GetGraduatedStudents()
}
