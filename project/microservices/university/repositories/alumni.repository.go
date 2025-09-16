package repositories

type AlumniRepository struct{}

func (r *AlumniRepository) GetGraduatedStudents() ([]string, error) {
	return []string{"Student1", "Student2"}, nil
}
