package repositories

type CourseRepository struct{}

func (r *CourseRepository) EnrollStudent(studentID string, courseID string) error {
	return nil
}

func (r *CourseRepository) GetStudents(courseID string) ([]string, error) {
	return nil, nil
}
