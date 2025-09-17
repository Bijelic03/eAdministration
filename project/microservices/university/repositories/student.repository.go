// package repositories

// type StudentRepository struct{}

// func (r *StudentRepository) RegisterExam(studentID string, examID string) error {
// 	return nil
// }

// func (r *StudentRepository) GetStudentCourses(studentID string) ([]string, error) {
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

type StudentStatus string

const (
	StudentActive    StudentStatus = "ACTIVE"
	StudentGraduated StudentStatus = "GRADUATED"
	StudentSuspended StudentStatus = "SUSPENDED"
)

type Student struct {
	ID       uuid.UUID     `json:"id" db:"id"`
	FullName string        `json:"fullname" db:"fullname"`
	Email    string        `json:"email" db:"email"`
	Password string        `json:"password" db:"password"`
	Role     string        `json:"role" db:"role"`
	Status   StudentStatus `json:"status" db:"status"`
	IndexNo  string        `json:"indexno" db:"indexno"`
}

// Education *EducationRecord `json:"education" db:"-"`

// type EducationRecord struct {
// 	ID               uuid.UUID        `json:"id" db:"id"`
// 	StudentID        uuid.UUID        `json:"studentId" db:"student_id"`
// 	FacultyName      string           `json:"facultyName" db:"faculty_name"` // samo jedan fakultet u sistemu
// 	ProgramName      string           `json:"programName" db:"program_name"`
// 	Degree           string           `json:"degree" db:"degree"` // BSc/MSc...
// 	StartDate        *time.Time       `json:"startDate" db:"start_date"`
// 	EndDate          *time.Time       `json:"endDate" db:"end_date"`
// 	Graduated        bool             `json:"graduated" db:"graduated"`
// 	GraduationDate   *time.Time       `json:"graduationDate" db:"graduation_date"`
// 	AvgGradeSnapshot *decimal.Decimal `json:"avgGradeSnapshot" db:"avg_grade_snapshot"` // službeni prosjek
// 	Verified         bool             `json:"verified" db:"verified"`                   // da li je verifikovano od fakulteta
// }

type StudentRepository struct {
	db *pgxpool.Pool
}

func NewStudentRepository(db *pgxpool.Pool) *StudentRepository {
	return &StudentRepository{db: db}
}

// Add new Student
func (r *StudentRepository) Add(ctx context.Context, stud *Student) (*Student, error) {
	query := `
		INSERT INTO users (fullname, email, password, status, indexno, role)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, fullname, email, password, status, indexno, role
	`

	stud.ID = uuid.New()
	var created Student

	err := r.db.QueryRow(ctx, query,
		stud.FullName,
		stud.Email,
		stud.Password,
		stud.Status,
		stud.IndexNo,
		stud.Role,
	).Scan(
		&created.ID,
		&created.FullName,
		&created.Email,
		&created.Password,
		&created.Status,
		&created.IndexNo,
		&created.Role,
	)

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" { // unique_violation
				return nil, fmt.Errorf("an student with this email already exists")
			}
		}
		return nil, err
	}
	return &created, nil
}

// Get student by ID
func (r *StudentRepository) GetByID(ctx context.Context, id uuid.UUID) (*Student, error) {
	query := `SELECT id, fullname, email, password, status, indexno, role FROM users WHERE id = $1`

	var stud Student
	err := r.db.QueryRow(ctx, query, id).Scan(
		&stud.ID,
		&stud.FullName,
		&stud.Email,
		&stud.Password,
		&stud.Status,
		&stud.IndexNo,
		&stud.Role,
	)
	if err != nil {
		return nil, err
	}
	return &stud, nil
}

// Get student by email
func (r *StudentRepository) GetByEmail(ctx context.Context, email string) (*Student, error) {
	query := `SELECT id, fullname, email, password, status, indexno, role FROM users WHERE email = $1`

	var stud Student
	err := r.db.QueryRow(ctx, query, email).Scan(
		&stud.ID,
		&stud.FullName,
		&stud.Email,
		&stud.Password,
		&stud.Status,
		&stud.IndexNo,
		&stud.Role,
	)
	if err != nil {
		return nil, err
	}
	return &stud, nil
}

// Get all students
func (r *StudentRepository) GetAll(ctx context.Context, page, limit int) ([]*Student, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, fullname, email, password, status, indexno, role 
	          FROM users 
			  WHERE role = 'student'
	          ORDER BY fullname 
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	students := make([]*Student, 0)
	for rows.Next() {
		var stud Student
		if err := rows.Scan(
			&stud.ID,
			&stud.FullName,
			&stud.Email,
			&stud.Password,
			&stud.Status,
			&stud.IndexNo,
			&stud.Role,
		); err != nil {
			return nil, 0, err
		}
		students = append(students, &stud)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE role = 'student'`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return students, totalItems, nil
}

// Update student
func (r *StudentRepository) Update(ctx context.Context, stud *Student) (*Student, error) {
	query := `
		UPDATE users
		SET fullname = $1, email = $2, password = $3, status = $4, indexno = $5, role = $6
		WHERE id = $7
		RETURNING id, fullname, email, password, status, indexno, role
	`

	var updated Student
	err := r.db.QueryRow(ctx, query,
		stud.FullName,
		stud.Email,
		stud.Password,
		stud.Status,
		stud.IndexNo,
		stud.Role,
		stud.ID,
	).Scan(
		&updated.ID,
		&updated.FullName,
		&updated.Email,
		&updated.Password,
		&updated.Role,
		&updated.Status,
		&updated.IndexNo,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// Delete student
func (r *StudentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
