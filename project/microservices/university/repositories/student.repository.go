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

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type StudentStatus string

const (
	StudentActive    StudentStatus = "ACTIVE"
	StudentGraduated StudentStatus = "GRADUATED"
)

type Student struct {
	ID       uuid.UUID      `json:"id" db:"id"`
	FullName string         `json:"fullname" db:"fullname"`
	Email    string         `json:"email" db:"email"`
	Password string         `json:"password" db:"password"`
	Role     string         `json:"role" db:"role"`
	Status   *StudentStatus `json:"status" db:"status"`
	IndexNo  *string        `json:"indexno" db:"indexno"`
	Ects   *string    `json:"ects" db:"ects"`
}

type StudentWithAvg struct {
	ID       uuid.UUID `json:"id"`
	FullName string    `json:"fullname"`
	Email    string    `json:"email"`
	IndexNo  *string   `json:"indexno"`
	AvgGrade *float64  `json:"avggrade"`
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
	hash, err := bcrypt.GenerateFromPassword([]byte(stud.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	stud.ID = uuid.New()
	var created Student

	err = r.db.QueryRow(ctx, query,
		stud.FullName,
		stud.Email,
		hash,
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

// GetAllIndexNumbers vraća sve indexno iz users tabele
// koji nisu vezani za korisnike sa ulogom "candidate" ili "employee"
func (r *StudentRepository) GetAllIndexNumbers(ctx context.Context) ([]string, error) {
	query := `
		SELECT indexno
		FROM users
		WHERE indexno IS NOT NULL
		AND indexno NOT IN (
			SELECT indexno
			FROM users
			WHERE role IN ('candidate', 'employee') AND indexno IS NOT NULL
		)
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var indices []string
	for rows.Next() {
		var idx string
		if err := rows.Scan(&idx); err != nil {
			return nil, err
		}
		indices = append(indices, idx)
	}

	return indices, nil
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

func (r *StudentRepository) GetStudentsByIndexWithAvgGrade(ctx context.Context, indices []string) ([]*StudentWithAvg, error) {
	if len(indices) == 0 {
		return []*StudentWithAvg{}, nil
	}

	query := `
    SELECT u.id, u.fullname, u.email, u.indexno, AVG(er.grade)::float AS avggrade
    FROM users u
    LEFT JOIN exam_registrations er ON u.id = er.studentid
    WHERE u.indexno = ANY($1)
    GROUP BY u.id, u.fullname, u.email, u.indexno
    ORDER BY avggrade DESC NULLS LAST
	`

	rows, err := r.db.Query(ctx, query, pq.Array(indices))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []*StudentWithAvg
	for rows.Next() {
		var s StudentWithAvg
		if err := rows.Scan(&s.ID, &s.FullName, &s.Email, &s.IndexNo, &s.AvgGrade); err != nil {
			return nil, err
		}
		result = append(result, &s)
	}
	return result, nil
}

// Get student by index number
func (r *StudentRepository) GetByIndexNo(ctx context.Context, indexNo string) (*Student, error) {
	query := `SELECT id, fullname, email, password, status, indexno, role FROM users WHERE indexno = $1`

	var stud Student
	err := r.db.QueryRow(ctx, query, indexNo).Scan(
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

// Update student
func (r *StudentRepository) Update(ctx context.Context, stud *Student) (*Student, error) {
	query := `
		UPDATE users
		SET fullname = $1, email = $2, password = $3, status = $4, indexno = $5, role = $6
		WHERE id = $7
		RETURNING id, fullname, email, password, status, indexno, role
	`

	hash, err := bcrypt.GenerateFromPassword([]byte(stud.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var updated Student
	err = r.db.QueryRow(ctx, query,
		stud.FullName,
		stud.Email,
		hash,
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
