package repositories

type GradeRepository struct{}

func (r *GradeRepository) EnterGrade(studentID string, courseID string, grade float64) error {
	return nil
}

func (r *GradeRepository) GetGrades(studentID string) (map[string]float64, error) {
	return nil, nil
}
