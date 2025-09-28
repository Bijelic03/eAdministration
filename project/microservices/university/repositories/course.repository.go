package repositories

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Course struct {
	ID          uuid.UUID `json:"id" db:"id"`
	Code        string    `json:"code" db:"code"`
	Name        string    `json:"name" db:"name"`
	Ects        string    `json:"ects" db:"ects"`
	Active      bool      `json:"active" db:"active"`
	SingletonID uuid.UUID `json:"singletonid" db:"singleton_id"`
}

type Singleton struct {
	ID   uuid.UUID `json:"id" db:"id"`
	Name string    `json:"name" db:"name"`
	Ects string    `json:"ects" db:"ects"`
}

type CourseRepository struct {
	db *pgxpool.Pool
}

func NewCourseRepository(db *pgxpool.Pool) *CourseRepository {
	return &CourseRepository{db: db}
}

// Add new course
func (r *CourseRepository) Add(ctx context.Context, cou *Course) (*Course, error) {
	query := `
		INSERT INTO courses (code, name, ects, active, singleton_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, code, name, ects, active, singleton_id
	`

	cou.ID = uuid.New()
	var created Course

	err := r.db.QueryRow(ctx, query,
		cou.Code,
		cou.Name,
		cou.Ects,
		cou.Active,
		cou.SingletonID,
	).Scan(
		&created.ID,
		&created.Code,
		&created.Name,
		&created.Ects,
		&created.Active,
		&created.SingletonID,
	)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			return nil, fmt.Errorf("a course with this code already exists")
		}
		return nil, err
	}

	return &created, nil
}

// Get course by ID
func (r *CourseRepository) GetByID(ctx context.Context, id uuid.UUID) (*Course, error) {
	query := `SELECT id, code, name, ects, active, singleton_id FROM courses WHERE id = $1`

	var cou Course
	err := r.db.QueryRow(ctx, query, id).Scan(
		&cou.ID,
		&cou.Code,
		&cou.Name,
		&cou.Ects,
		&cou.Active,
		&cou.SingletonID,
	)
	if err != nil {
		return nil, err
	}
	return &cou, nil
}

// Get all courses
func (r *CourseRepository) GetAll(ctx context.Context, page, limit int) ([]*Course, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, code, name, ects, active, singleton_id
	          FROM courses 
	          ORDER BY code 
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	courses := make([]*Course, 0)
	for rows.Next() {
		var cou Course
		if err := rows.Scan(
			&cou.ID,
			&cou.Code,
			&cou.Name,
			&cou.Ects,
			&cou.Active,
			&cou.SingletonID,
		); err != nil {
			return nil, 0, err
		}
		courses = append(courses, &cou)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM courses`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return courses, totalItems, nil
}

// Update course
func (r *CourseRepository) Update(ctx context.Context, cou *Course) (*Course, error) {
	query := `
		UPDATE courses
		SET code = $1, name = $2, ects = $3, active = $4, singleton_id = $5
		WHERE id = $6
		RETURNING id, code, name, ects, active, singleton_id
	`

	var updated Course
	err := r.db.QueryRow(ctx, query,
		cou.Code,
		cou.Name,
		cou.Ects,
		cou.Active,
		cou.SingletonID,
		cou.ID,
	).Scan(
		&updated.ID,
		&updated.Code,
		&updated.Name,
		&updated.Ects,
		&updated.Active,
		&updated.SingletonID,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// Delete course
func (r *CourseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM courses WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *CourseRepository) GetAllPrograms(ctx context.Context, page, limit int) ([]*Singleton, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, name, ects, courses
	          FROM singleton
	          ORDER BY name
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	programs := make([]*Singleton, 0)
	for rows.Next() {
		var prog Singleton
		var coursesJSON []byte
		if err := rows.Scan(
			&prog.ID,
			&prog.Name,
			&prog.Ects,
			&coursesJSON,
		); err != nil {
			return nil, 0, err
		}

		programs = append(programs, &prog)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM singleton`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return programs, totalItems, nil
}

// Get all courses for a given program
func (r *CourseRepository) GetByProgram(ctx context.Context, programID uuid.UUID, page, limit int) ([]*Course, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, code, name, ects, active, singleton_id
	          FROM courses
	          WHERE singleton_id = $1
	          ORDER BY code
	          LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, programID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	courses := make([]*Course, 0)
	for rows.Next() {
		var cou Course
		if err := rows.Scan(
			&cou.ID,
			&cou.Code,
			&cou.Name,
			&cou.Ects,
			&cou.Active,
			&cou.SingletonID,
		); err != nil {
			return nil, 0, err
		}
		courses = append(courses, &cou)
	}

	// count total for this program
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM courses WHERE singleton_id = $1`, programID).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return courses, totalItems, nil
}

func (r *CourseRepository) GetUserProgramID(ctx context.Context, email string) (uuid.UUID, error) {
	var programID uuid.UUID
	query := `SELECT singleton_id FROM users WHERE email = $1 AND role = 'student'`
	if err := r.db.QueryRow(ctx, query, email).Scan(&programID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return uuid.Nil, fmt.Errorf("no student found with email %s", email)
		}
		return uuid.Nil, err
	}
	return programID, nil
}
