package repositories

type RankingRepository struct {
	// npr. db konekcija
}

// Dohvati sve kandidate prijavljene na određeni posao
func (r *RankingRepository) GetCandidatesForJob(jobID string) ([]string, error) {
	return nil, nil
}

// Dohvati zvanični GPA kandidata
func (r *RankingRepository) GetCandidateGPA(candidateID string) (float64, error) {
	return 0, nil
}

// Dohvati ocene kandidata po predmetima (ako je potrebno)
func (r *RankingRepository) GetCandidateGrades(candidateID string) (map[string]float64, error) {
	return nil, nil
}
