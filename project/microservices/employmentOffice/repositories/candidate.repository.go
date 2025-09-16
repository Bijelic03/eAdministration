package repositories

import (
	"errors"

	"employmentOffice/model"
)

type CandidateRepository struct {
	// TODO: dodaj konekciju ka DB (npr. *sql.DB ili *gorm.DB)
}

// =================== CRUD ===================

func (r *CandidateRepository) Create(candidate *model.Candidate) error {
	// TODO: Implementiraj INSERT u bazu
	return nil
}

func (r *CandidateRepository) GetAll() ([]model.Candidate, error) {
	// TODO: Implementiraj SELECT *
	return []model.Candidate{}, nil
}

func (r *CandidateRepository) GetByID(id string) (*model.Candidate, error) {
	// TODO: Implementiraj SELECT WHERE id=...
	return &model.Candidate{}, nil
}

func (r *CandidateRepository) Update(candidate *model.Candidate) error {
	// TODO: Implementiraj UPDATE
	return nil
}

func (r *CandidateRepository) Delete(id string) error {
	// TODO: Implementiraj DELETE
	return nil
}

// =============== DODATNE FUNKCIJE ===============

// Spremanje prijave kandidata na ponudu
func (r *CandidateRepository) SaveApplication(candidateID string, jobID string) error {
	// TODO: INSERT INTO applications...
	return nil
}

// Provjera obrazovanja kandidata
func (r *CandidateRepository) CheckEducation(candidateID string) (bool, error) {
	// TODO: SELECT verified FROM education_records...
	return true, nil
}
