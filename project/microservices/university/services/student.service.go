package services

import "github.com/Bijelic03/eAdministration/project/microservices/university/repositories"

type StudentService struct {
	studentRepo *repositories.StudentRepository
	courseRepo  *repositories.CourseRepository
}

func (s *StudentService) RegisterExam(studentID string, examID string) error {
	return s.studentRepo.RegisterExam(studentID, examID)
}

func (s *StudentService) EnrollCourse(studentID string, courseID string) error {
	return s.courseRepo.EnrollStudent(studentID, courseID)
}
