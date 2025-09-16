package services

import "university/repositories"

type ProfessorService struct {
	gradeRepo *repositories.GradeRepository
}

func (s *ProfessorService) EnterGrade(studentID string, courseID string, grade float64) error {
	return s.gradeRepo.EnterGrade(studentID, courseID, grade)
}
