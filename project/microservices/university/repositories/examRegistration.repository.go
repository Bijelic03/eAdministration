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
	Passed    bool      `json:"passed" db:"passed"`
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
		CreatedAt: time.Now(),
		Grade:     nil,
		Passed:    false,
	}

	ins := `
    INSERT INTO exam_registrations (id, examid, studentid, createdat, grade, passed)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, examid, studentid, createdat, grade, passed
`

	if err := r.db.QueryRow(ctx, ins,
		reg.ID, reg.ExamID, reg.StudentID, reg.CreatedAt, reg.Grade, reg.Passed,
	).Scan(&reg.ID, &reg.ExamID, &reg.StudentID, &reg.CreatedAt, &reg.Grade, &reg.Passed); err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			return nil, fmt.Errorf("student already registered for this exam")
		}
		return nil, err
	}

	return reg, nil
}

func (r *ExamRegistrationRepository) GetByID(ctx context.Context, id uuid.UUID) (*ExamRegistration, error) {
	query := `
		SELECT id, examid, studentid, createdat, grade, passed
		FROM exam_registrations
		WHERE id = $1
	`

	var reg ExamRegistration
	err := r.db.QueryRow(ctx, query, id).Scan(
		&reg.ID,
		&reg.ExamID,
		&reg.StudentID,
		&reg.CreatedAt,
		&reg.Grade,
		&reg.Passed,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("exam registration with id %s not found", id)
		}
		return nil, err
	}

	return &reg, nil
}

func (r *ExamRegistrationRepository) GetByExamID(ctx context.Context, id uuid.UUID) ([]*ExamRegistration, error) {
	query := `
		SELECT id, examid, studentid, createdat, grade, passed
		FROM exam_registrations
		WHERE examid = $1
	`

	rows, err := r.db.Query(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var regs []*ExamRegistration
	for rows.Next() {
		var reg ExamRegistration
		if err := rows.Scan(&reg.ID, &reg.ExamID, &reg.StudentID, &reg.CreatedAt, &reg.Grade, &reg.Passed); err != nil {
			return nil, err
		}
		regs = append(regs, &reg)
	}

	if len(regs) == 0 {
		return nil, fmt.Errorf("no registrations found for exam %s", id)
	}

	return regs, nil
}

func (r *ExamRegistrationRepository) GetByStudentIDAndExamID(ctx context.Context, studentID, examID uuid.UUID) (*ExamRegistration, error) {
	query := `
		SELECT id, examid, studentid, createdat, grade, passed
		FROM exam_registrations
		WHERE studentid = $1 AND examid = $2
	`

	var reg ExamRegistration
	err := r.db.QueryRow(ctx, query, studentID, examID).Scan(
		&reg.ID,
		&reg.ExamID,
		&reg.StudentID,
		&reg.CreatedAt,
		&reg.Grade,
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
	SELECT id, examid, studentid, createdat, grade, passed
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

	var existingGrade *int
	checkQuery := `
        SELECT grade
        FROM exam_registrations
        WHERE examid = $1 AND studentid = $2
    `
	if err := r.db.QueryRow(ctx, checkQuery, examID, studentID).Scan(&existingGrade); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("registration not found for exam %s and student %s", examID, studentID)
		}
		return nil, err
	}
	if existingGrade != nil {
		return nil, fmt.Errorf("Ocena je vec upisana za ovaj ispit")
	}

	query := `
        UPDATE exam_registrations
        SET grade = $1,
            passed = CASE WHEN $1 >= 6 THEN TRUE ELSE FALSE END
        WHERE examid = $2 AND studentid = $3
        RETURNING id, examid, studentid, createdat, grade, passed
    `

	var reg ExamRegistration
	err := r.db.QueryRow(ctx, query, grade, examID, studentID).Scan(
		&reg.ID,
		&reg.ExamID,
		&reg.StudentID,
		&reg.CreatedAt,
		&reg.Grade,
		&reg.Passed,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("registration not found for exam %s and student %s", examID, studentID)
		}
		return nil, err
	}

	if grade >= 6 {
		var espb int
		getEspb := `
			SELECT c.ects
			FROM exams e
			JOIN courses c ON e.courseid::uuid = c.id
			WHERE e.id = $1
        `
		if err := r.db.QueryRow(ctx, getEspb, examID).Scan(&espb); err != nil {
			return nil, fmt.Errorf("failed to get espb for exam %s: %w", examID, err)
		}

		updateUser := `
            UPDATE users
            SET ects = COALESCE(ects, '0')::int + $1
            WHERE id = $2
        `
		if _, err := r.db.Exec(ctx, updateUser, espb, studentID); err != nil {
			return nil, fmt.Errorf("failed to update ects for student %s: %w", studentID, err)
		}

		var studentECTS, requiredECTS int
		getECTS := `
			SELECT COALESCE(u.ects, '0')::int, p.ects::int
			FROM users u
			JOIN exam_registrations er ON er.studentid = u.id
			JOIN exams e ON er.examid = e.id
			JOIN courses c ON e.courseid::uuid = c.id
			JOIN singleton p ON c.singleton_id = p.id
			WHERE u.id = $1 AND e.id = $2
		`
		if err := r.db.QueryRow(ctx, getECTS, studentID, examID).Scan(&studentECTS, &requiredECTS); err != nil {
			return nil, fmt.Errorf("failed to check graduation status for student %s: %w", studentID, err)
		}

		if studentECTS >= requiredECTS {
			markGraduated := `
				UPDATE users
				SET status = 'GRADUATED'
				WHERE id = $1
			`
			if _, err := r.db.Exec(ctx, markGraduated, studentID); err != nil {
				return nil, fmt.Errorf("failed to mark student %s as GRADUATED: %w", studentID, err)
			}
		}
	}

	return &reg, nil
}
