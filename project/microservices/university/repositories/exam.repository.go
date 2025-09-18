package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Exam struct {
	ID          uuid.UUID `json:"id" db:"id"`
	ExamTime    time.Time `json:"examtime" db:"examtime"`
	CourseID    string    `json:"courseid" db:"courseid"`
	ProfessorID string    `json:"professorid" db:"professorid"`
}

type ExamRepository struct {
	db *pgxpool.Pool
}

func NewExamRepository(db *pgxpool.Pool) *ExamRepository {
	return &ExamRepository{db: db}
}

// Add new exam
func (r *ExamRepository) Add(ctx context.Context, exam *Exam) (*Exam, error) {
	query := `
		INSERT INTO exams (examtime, courseid, professorid)
		VALUES ($1, $2, $3)
		RETURNING id, examtime, courseid, professorid
	`

	exam.ID = uuid.New()
	var created Exam

	err := r.db.QueryRow(ctx, query,
		exam.ExamTime,
		exam.CourseID,
		exam.ProfessorID,
	).Scan(
		&created.ID,
		&created.ExamTime,
		&created.CourseID,
		&created.ProfessorID,
	)

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" {
				return nil, fmt.Errorf("an exam with this id already exists")
			}
		}
		return nil, err
	}
	return &created, nil
}

// Get exam by ID
func (r *ExamRepository) GetByID(ctx context.Context, id uuid.UUID) (*Exam, error) {
	query := `SELECT id, examtime, courseid, professorid FROM exams WHERE id = $1`

	var exam Exam
	err := r.db.QueryRow(ctx, query, id).Scan(
		&exam.ID,
		&exam.ExamTime,
		&exam.CourseID,
		&exam.ProfessorID,
	)
	if err != nil {
		return nil, err
	}
	return &exam, nil
}

// Get all exams with pagination
func (r *ExamRepository) GetAll(ctx context.Context, page, limit int) ([]*Exam, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, examtime, courseid, professorid 
	          FROM exams 
	          ORDER BY examtime 
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	exams := make([]*Exam, 0)
	for rows.Next() {
		var exam Exam
		if err := rows.Scan(
			&exam.ID,
			&exam.ExamTime,
			&exam.CourseID,
			&exam.ProfessorID,
		); err != nil {
			return nil, 0, err
		}
		exams = append(exams, &exam)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM exams`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return exams, totalItems, nil
}

// Update exam
func (r *ExamRepository) Update(ctx context.Context, exam *Exam) (*Exam, error) {
	query := `
		UPDATE exams
		SET examtime = $1, courseid = $2, professorid = $3
		WHERE id = $4
		RETURNING id, examtime, courseid, professorid
	`

	var updated Exam
	err := r.db.QueryRow(ctx, query,
		exam.ExamTime,
		exam.CourseID,
		exam.ProfessorID,
		exam.ID,
	).Scan(
		&updated.ID,
		&updated.ExamTime,
		&updated.CourseID,
		&updated.ProfessorID,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// Delete exam
func (r *ExamRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM exams WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
