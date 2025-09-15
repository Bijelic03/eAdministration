package repositories

type CandidateRepository struct {
	// npr. db konekcija
}

// Spremanje prijave kandidata na ponudu
func (r *CandidateRepository) SaveApplication(candidateID string, jobID string) error {
	return nil
}

// Provjera obrazovanja kandidata
func (r *CandidateRepository) CheckEducation(candidateID string) (bool, error) {
	return true, nil
}
