package repositories

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ExamRegistration struct {
	ID        uuid.UUID `json:"id" db:"id"`
	ExamID    uuid.UUID `json:"examid" db:"examid"`
	StudentID uuid.UUID `json:"studentid" db:"studentid"`
	CreatedAt time.Time `json:"createdat" db:"createdat"`
	Grade     *int      `json:"grade,omitempty" db:"grade"`
}

type ExamRegistrationRepository struct {
	db *pgxpool.Pool
}

func NewExamRegistrationRepository(db *pgxpool.Pool) *ExamRegistrationRepository {
	return &ExamRegistrationRepository{db: db}
}

func (r *ExamRegistrationRepository) Register(ctx context.Context, examID uuid.UUID, studentEmail string) (*ExamRegistration, error) {
	var studentID uuid.UUID
	q := `SELECT id FROM users WHERE email = $1 AND role = 'student'`
	if err := r.db.QueryRow(ctx, q, studentEmail).Scan(&studentID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("student with email %s not found", studentEmail)
		}
		return nil, err
	}

	reg := &ExamRegistration{
		ID:        uuid.New(),
		ExamID:    examID,
		StudentID: studentID,
	}

	ins := `
        INSERT INTO exam_registrations (id, examid, studentid)
        VALUES ($1, $2, $3)
        RETURNING id, examid, studentid, createdat
    `
	if err := r.db.QueryRow(ctx, ins,
		reg.ID, reg.ExamID, reg.StudentID,
	).Scan(&reg.ID, &reg.ExamID, &reg.StudentID, &reg.CreatedAt); err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			return nil, fmt.Errorf("student already registered for this exam")
		}
		return nil, err
	}

	return reg, nil
}

func (r *ExamRegistrationRepository) GetByStudentEmail(ctx context.Context, email string) ([]*ExamRegistration, error) {
	var studentID uuid.UUID
	q := `SELECT id FROM users WHERE email = $1 AND role = 'student'`
	if err := r.db.QueryRow(ctx, q, email).Scan(&studentID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("student with email %s not found", email)
		}
		return nil, err
	}

	query := `
	SELECT id, examid, studentid, createdat, grade
	FROM exam_registrations
	WHERE studentid = $1
	ORDER BY createdat DESC
	`

	rows, err := r.db.Query(ctx, query, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var regs []*ExamRegistration
	for rows.Next() {
		var reg ExamRegistration
		if err := rows.Scan(&reg.ID, &reg.ExamID, &reg.StudentID, &reg.CreatedAt, &reg.Grade); err != nil {
			return nil, err
		}
		regs = append(regs, &reg)
	}

	return regs, nil
}

func (r *ExamRegistrationRepository) EnterGrade(ctx context.Context, examID, studentID uuid.UUID, grade int) (*ExamRegistration, error) {
	query := `
		UPDATE exam_registrations
		SET grade = $1
		WHERE examid = $2 AND studentid = $3
		RETURNING id, examid, studentid, createdat, grade
	`

	var reg ExamRegistration
	err := r.db.QueryRow(ctx, query, grade, examID, studentID).Scan(
		&reg.ID,
		&reg.ExamID,
		&reg.StudentID,
		&reg.CreatedAt,
		&reg.Grade,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("registration not found for exam %s and student %s", examID, studentID)
		}
		return nil, err
	}

	return &reg, nil
}
