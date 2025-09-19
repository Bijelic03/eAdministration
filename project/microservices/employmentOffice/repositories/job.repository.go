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
	"database/sql"
	"errors"
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

type JobApplication struct {
	ID          uuid.UUID `json:"id" db:"id"`
	JobID       uuid.UUID `json:"jobid" db:"jobid"`
	CandidateID uuid.UUID `json:"candidateid" db:"candidateid"`
}

type JobApplicationRepository struct {
	db *pgxpool.Pool
}

type Interview struct {
	ID               uuid.UUID `json:"id" db:"id"`
	JobApplicationID uuid.UUID `json:"jobapplicationid" db:"jobapplicationid"`
	CandidateID      uuid.UUID `json:"candidateid" db:"candidateid"`
	JobID            uuid.UUID `json:"jobid" db:"jobid"`
	DateTime         string    `json:"datetime" db:"datetime"`
	Type             string    `json:"type" db:"type"`
	Location         string    `json:"location" db:"location"`
}

type InterviewRepository struct {
	db *pgxpool.Pool
}

func NewJobRepository(db *pgxpool.Pool) *JobRepository {
	return &JobRepository{db: db}
}

func NewJobApplicationRepository(db *pgxpool.Pool) *JobApplicationRepository {
	return &JobApplicationRepository{db: db}
}

func NewJobInterviewRepository(db *pgxpool.Pool) *InterviewRepository {
	return &InterviewRepository{db: db}
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

// Apply for a job
func (r *JobApplicationRepository) ApplyForJob(ctx context.Context, j *JobApplication) (*JobApplication, error) {
	query := `
		INSERT INTO jobapplications (id, jobid, candidateid)
		VALUES ($1, $2, $3)
		RETURNING id, jobid, candidateid
	`

	j.ID = uuid.New()
	var created JobApplication

	err := r.db.QueryRow(ctx, query,
		j.ID,
		j.JobID,
		j.CandidateID,
	).Scan(
		&created.ID,
		&created.JobID,
		&created.CandidateID,
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

func (r *JobApplicationRepository) GetJobApplicationByCandidateIDAndByJobID(ctx context.Context, jobID, candidateID uuid.UUID) (*JobApplication, error) {
	query := `SELECT id, jobid, candidateid
              FROM jobapplications
              WHERE jobid = $1 AND candidateid = $2`

	var ja JobApplication
	err := r.db.QueryRow(ctx, query, jobID, candidateID).Scan(
		&ja.ID,
		&ja.JobID,
		&ja.CandidateID,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &ja, nil
}

// Get all job apps (paginated)
func (r *JobApplicationRepository) GetAllJobApplications(ctx context.Context, page, limit int) ([]*JobApplication, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, jobid, candidateid
	          FROM jobapplications
	          ORDER BY jobid
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	jobapps := make([]*JobApplication, 0)
	for rows.Next() {
		var j JobApplication
		if err := rows.Scan(
			&j.ID,
			&j.JobID,
			&j.CandidateID,
		); err != nil {
			return nil, 0, err
		}
		jobapps = append(jobapps, &j)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM jobapplications`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return jobapps, totalItems, nil
}

func (r *JobApplicationRepository) GetStudentIndicesByJobID(ctx context.Context, jobID uuid.UUID) ([]string, error) {
	query := `
		SELECT u.studentid
		FROM jobapplications ja
		JOIN users u ON ja.candidateid = u.id
		WHERE ja.jobid = $1
	`

	rows, err := r.db.Query(ctx, query, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var indices []string
	for rows.Next() {
		var idx *string
		if err := rows.Scan(&idx); err != nil {
			return nil, err
		}

		if idx != nil {
			indices = append(indices, *idx)
			fmt.Printf("Found student index: %s\n", *idx)
		} else {
			fmt.Println("Found NULL index")
		}
	}

	fmt.Printf("Final indices list for job %s: %+v\n", jobID, indices)

	return indices, nil
}


// Delete jobapplication
func (r *JobApplicationRepository) DeleteJobApplication(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM jobapplications WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

// Schedule interview
func (r *InterviewRepository) ScheduleInterview(ctx context.Context, j *Interview) (*Interview, error) {
	query := `
		INSERT INTO interviews (id, jobapplicationid, candidateid, jobid, datetime, type, location)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, jobapplicationid, candidateid, jobid, datetime, type, location
	`

	j.ID = uuid.New()
	var created Interview

	err := r.db.QueryRow(ctx, query,
		j.ID,
		j.JobApplicationID,
		j.CandidateID,
		j.JobID,
		j.DateTime,
		j.Type,
		j.Location,
	).Scan(
		&created.ID,
		&created.JobApplicationID,
		&created.CandidateID,
		&created.JobID,
		&created.DateTime,
		&created.Type,
		&created.Location,
	)

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" { // unique_violation
				return nil, fmt.Errorf("a interview with this id already exists")
			}
		}
		return nil, err
	}
	return &created, nil
}

// Get all interviews paginated
func (r *InterviewRepository) GetAllInterviews(ctx context.Context, page, limit int) ([]*Interview, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, jobid, candidateid, jobapplicationid, datetime, type, location
	          FROM interviews
	          ORDER BY jobid
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	interviews := make([]*Interview, 0)
	for rows.Next() {
		var j Interview
		if err := rows.Scan(
			&j.ID,
			&j.JobID,
			&j.CandidateID,
			&j.JobApplicationID,
			&j.DateTime,
			&j.Type,
			&j.Location,
		); err != nil {
			return nil, 0, err
		}
		interviews = append(interviews, &j)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM interviews`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return interviews, totalItems, nil
}

// Delete interview
func (r *InterviewRepository) DeleteInterview(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM interviews WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
