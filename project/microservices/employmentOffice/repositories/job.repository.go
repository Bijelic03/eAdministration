// package repositories

// type JobRepository struct {
// 	// npr. db konekcija
// }

// // Spremanje ponude za posao/praksu
// func (r *JobRepository) SaveJob(jobData interface{}) error {
// 	return nil
// }

// // Spremanje zakazanog intervjua
// func (r *JobRepository) SaveInterview(jobID string, candidateID string, datetime string) error {
// 	return nil
// }

// // Dohvat kandidata za rangiranje
//
//	func (r *JobRepository) GetCandidates(jobID string) ([]string, error) {
//		return []string{"cand1", "cand2"}, nil
//	}
package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Job struct {
	ID              uuid.UUID `json:"id" db:"id"`
	EmployerID      uuid.UUID `json:"employerid" db:"employerid"`
	Title           string    `json:"title" db:"title"`
	Description     string    `json:"description" db:"description"`
	Location        string    `json:"location" db:"location"`
	RequiredFaculty *bool     `json:"requiredfaculty" db:"requiredfaculty"`
}

type JobRepository struct {
	db *pgxpool.Pool
}

func NewJobRepository(db *pgxpool.Pool) *JobRepository {
	return &JobRepository{db: db}
}

// Add new Job
func (r *JobRepository) Add(ctx context.Context, j *Job) (*Job, error) {
	query := `
		INSERT INTO jobs (id, employerid, title, description, location, requiredfaculty)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, employerid, title, description, location, requiredfaculty
	`

	j.ID = uuid.New()
	var created Job

	err := r.db.QueryRow(ctx, query,
		j.ID,
		j.EmployerID,
		j.Title,
		j.Description,
		j.Location,
		j.RequiredFaculty,
	).Scan(
		&created.ID,
		&created.EmployerID,
		&created.Title,
		&created.Description,
		&created.Location,
		&created.RequiredFaculty,
	)

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" { // unique_violation
				return nil, fmt.Errorf("a job with this id already exists")
			}
		}
		return nil, err
	}
	return &created, nil
}

// Get job by ID
func (r *JobRepository) GetByID(ctx context.Context, id uuid.UUID) (*Job, error) {
	query := `SELECT id, employerid, title, description, location, requiredfaculty 
	          FROM jobs WHERE id = $1`

	var job Job
	err := r.db.QueryRow(ctx, query, id).Scan(
		&job.ID,
		&job.EmployerID,
		&job.Title,
		&job.Description,
		&job.Location,
		&job.RequiredFaculty,
	)
	if err != nil {
		return nil, err
	}
	return &job, nil
}

// Get all jobs (paginated)
func (r *JobRepository) GetAll(ctx context.Context, page, limit int) ([]*Job, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, employerid, title, description, location, requiredfaculty 
	          FROM jobs
	          ORDER BY title
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	jobs := make([]*Job, 0)
	for rows.Next() {
		var j Job
		if err := rows.Scan(
			&j.ID,
			&j.EmployerID,
			&j.Title,
			&j.Description,
			&j.Location,
			&j.RequiredFaculty,
		); err != nil {
			return nil, 0, err
		}
		jobs = append(jobs, &j)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM jobs`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return jobs, totalItems, nil
}

// Update job
func (r *JobRepository) Update(ctx context.Context, j *Job) (*Job, error) {
	query := `
		UPDATE jobs
		SET employerid = $1, title = $2, description = $3, location = $4, requiredfaculty = $5
		WHERE id = $6
		RETURNING id, employerid, title, description, location, requiredfaculty
	`

	var updated Job
	err := r.db.QueryRow(ctx, query,
		j.EmployerID,
		j.Title,
		j.Description,
		j.Location,
		j.RequiredFaculty,
		j.ID,
	).Scan(
		&updated.ID,
		&updated.EmployerID,
		&updated.Title,
		&updated.Description,
		&updated.Location,
		&updated.RequiredFaculty,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// Delete job
func (r *JobRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM jobs WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
