// package repositories

// type CourseRepository struct{}

// func (r *CourseRepository) EnrollStudent(studentID string, courseID string) error {
// 	return nil
// }

// func (r *CourseRepository) GetStudents(courseID string) ([]string, error) {
// 	return nil, nil
// }

package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Course struct {
	ID     uuid.UUID `json:"id" db:"id"`
	Code   string    `json:"code" db:"code"`
	Name   string    `json:"name" db:"name"`
	Ects   string    `json:"ects" db:"ects"`
	Active bool      `json:"active" db:"active"`
}

type Singleton struct {
	ID      uuid.UUID `json:"id" db:"id"`
	Name    string    `json:"name" db:"name"`
	Ects    string    `json:"ects" db:"ects"`
	Courses []Course  `json:"courses"`
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
		INSERT INTO courses (code, name, ects, active)
		VALUES ($1, $2, $3, $4)
		RETURNING id, code, name, ects, active
	`

	cou.ID = uuid.New()
	var created Course

	err := r.db.QueryRow(ctx, query,
		cou.Code,
		cou.Name,
		cou.Ects,
		cou.Active,
	).Scan(
		&created.ID,
		&created.Code,
		&created.Name,
		&created.Ects,
		&created.Active,
	)

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" { // unique_violation
				return nil, fmt.Errorf("an course with this code already exists")
			}
		}
		return nil, err
	}
	return &created, nil
}

// Get course by ID
func (r *CourseRepository) GetByID(ctx context.Context, id uuid.UUID) (*Course, error) {
	query := `SELECT id, code, name, ects, active FROM courses WHERE id = $1`

	var cou Course
	err := r.db.QueryRow(ctx, query, id).Scan(
		&cou.ID,
		&cou.Code,
		&cou.Name,
		&cou.Ects,
		&cou.Active,
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

	query := `SELECT id, code, name, ects, active 
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
		); err != nil {
			return nil, 0, err
		}
		courses = append(courses, &cou)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return courses, totalItems, nil
}

// Update course
func (r *CourseRepository) Update(ctx context.Context, cou *Course) (*Course, error) {
	query := `
		UPDATE courses
		SET code = $1, name = $2, ects = $3, active = $4
		WHERE id = $5
		RETURNING id, code, name, ects, active
	`

	var updated Course
	err := r.db.QueryRow(ctx, query,
		cou.Code,
		cou.Name,
		cou.Ects,
		cou.Active,
		cou.ID,
	).Scan(
		&updated.ID,
		&updated.Code,
		&updated.Name,
		&updated.Ects,
		&updated.Active,
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
