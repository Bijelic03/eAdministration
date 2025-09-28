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

type CourseRegistration struct {
	ID        uuid.UUID `json:"id" db:"id"`
	CourseID  uuid.UUID `json:"courseid" db:"courseid"`
	StudentID uuid.UUID `json:"studentid" db:"studentid"`
	CreatedAt time.Time `json:"createdat" db:"createdat"`
	Passed    bool      `json:"passed" db:"passed"`
}

type CourseRegistrationRepository struct {
	db *pgxpool.Pool
}

func NewCourseRegistrationRepository(db *pgxpool.Pool) *CourseRegistrationRepository {
	return &CourseRegistrationRepository{db: db}
}

func (r *CourseRegistrationRepository) GetByStudentIDAndCourseID(ctx context.Context, studentID, courseID uuid.UUID) (*CourseRegistration, error) {
	query := `
		SELECT id, courseid, studentid, passed
		FROM course_registrations
		WHERE studentid = $1 AND courseid = $2
	`

	var reg CourseRegistration
	err := r.db.QueryRow(ctx, query, studentID, courseID).Scan(
		&reg.ID,
		&reg.CourseID,
		&reg.StudentID,
		&reg.Passed,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// registracija ne postoji
			return nil, nil
		}
		return nil, err
	}

	return &reg, nil
}

// Register student to course
func (r *CourseRegistrationRepository) Register(ctx context.Context, courseID uuid.UUID, studentEmail string) (*CourseRegistration, error) {
	var studentID uuid.UUID
	q := `SELECT id FROM users WHERE email = $1 AND role = 'student'`
	if err := r.db.QueryRow(ctx, q, studentEmail).Scan(&studentID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("student with email %s not found", studentEmail)
		}
		return nil, err
	}

	reg := &CourseRegistration{
		ID:        uuid.New(),
		CourseID:  courseID,
		StudentID: studentID,
		Passed:    false,
	}

	ins := `
        INSERT INTO course_registrations (id, courseid, studentid, passed)
        VALUES ($1, $2, $3, $4)
        RETURNING id, courseid, studentid, createdat, passed
    `
	if err := r.db.QueryRow(ctx, ins,
		reg.ID, reg.CourseID, reg.StudentID, false,
	).Scan(&reg.ID, &reg.CourseID, &reg.StudentID, &reg.CreatedAt, &reg.Passed); err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			return nil, fmt.Errorf("student already registered for this course")
		}
		return nil, err
	}

	return reg, nil
}

// Get all course registrations by student email
func (r *CourseRegistrationRepository) GetByStudentEmail(ctx context.Context, email string) ([]*CourseRegistration, error) {
	var studentID uuid.UUID
	q := `SELECT id FROM users WHERE email = $1 AND role = 'student'`
	if err := r.db.QueryRow(ctx, q, email).Scan(&studentID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("student with email %s not found", email)
		}
		return nil, err
	}

	query := `
		SELECT id, courseid, studentid, createdat, passed
		FROM course_registrations
		WHERE studentid = $1
		ORDER BY createdat DESC
	`

	rows, err := r.db.Query(ctx, query, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var regs []*CourseRegistration
	for rows.Next() {
		var reg CourseRegistration
		if err := rows.Scan(&reg.ID, &reg.CourseID, &reg.StudentID, &reg.CreatedAt, &reg.Passed); err != nil {
			return nil, err
		}
		regs = append(regs, &reg)
	}

	return regs, nil
}
