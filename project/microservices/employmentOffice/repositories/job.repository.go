package repositories

type JobRepository struct {
	// npr. db konekcija
}

// Spremanje ponude za posao/praksu
func (r *JobRepository) SaveJob(jobData interface{}) error {
	return nil
}

// Spremanje zakazanog intervjua
func (r *JobRepository) SaveInterview(jobID string, candidateID string, datetime string) error {
	return nil
}

// Dohvat kandidata za rangiranje
func (r *JobRepository) GetCandidates(jobID string) ([]string, error) {
	return []string{"cand1", "cand2"}, nil
}
