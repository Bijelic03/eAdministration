package repositories

type StudentRepository struct{}

func (r *StudentRepository) RegisterExam(studentID string, examID string) error {
	return nil
}

func (r *StudentRepository) GetStudentCourses(studentID string) ([]string, error) {
	return nil, nil
}
