package services

import "university/repositories"

type GPAService struct {
	gradeRepo *repositories.GradeRepository
}

func (s *GPAService) GetGPA(studentID string) (float64, error) {
	//grades, _ := s.gradeRepo.GetGrades(studentID) //

	// logika izračuna GPA ide kasnije
	return 0, nil
}
