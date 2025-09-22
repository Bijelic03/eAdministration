package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Employee struct {
	ID       uuid.UUID `json:"id" db:"id"`
	FullName string    `json:"fullname" db:"fullname"`
	Email    string    `json:"email" db:"email"`
	Password string    `json:"password" db:"password"`
	Role     string    `json:"role" db:"role"`
	JobID    *uuid.UUID `json:"jobid" db:"jobid"`
	IndexNo *string   `json:"indexno" db:"indexno"`
}

type EmployeeRepository struct {
	db *pgxpool.Pool
}

func NewEmployeeRepository(db *pgxpool.Pool) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

// Add new employee
func (r *EmployeeRepository) Add(ctx context.Context, emp *Employee) (*Employee, error) {
	query := `
		INSERT INTO users (fullname, email, password, role, jobid, indexno)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, fullname, email, password, role, jobid, indexno
	`

	hash, err := bcrypt.GenerateFromPassword([]byte(emp.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	emp.ID = uuid.New()
	var created Employee

	err = r.db.QueryRow(ctx, query,
		emp.FullName,
		emp.Email,
		hash,
		emp.Role,
		emp.JobID,
		emp.IndexNo,
	).Scan(
		&created.ID,
		&created.FullName,
		&created.Email,
		&created.Password,
		&created.Role,
		&created.JobID,
		&created.IndexNo,
	)

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" { // unique_violation
				return nil, fmt.Errorf("an employee with this email already exists")
			}
		}
		return nil, err
	}
	return &created, nil
}

// Get employee by ID
func (r *EmployeeRepository) GetByID(ctx context.Context, id uuid.UUID) (*Employee, error) {
	query := `SELECT id, fullname, email, password, role, jobid, indexno FROM users WHERE id = $1`

	var emp Employee
	err := r.db.QueryRow(ctx, query, id).Scan(
		&emp.ID,
		&emp.FullName,
		&emp.Email,
		&emp.Password,
		&emp.Role,
		&emp.JobID,
		&emp.IndexNo,
	)
	if err != nil {
		return nil, err
	}
	return &emp, nil
}

// Get employee by email
func (r *EmployeeRepository) GetByEmail(ctx context.Context, email string) (*Employee, error) {
	query := `SELECT id, fullname, email, password, role, jobid, indexno FROM users WHERE email = $1`

	var emp Employee
	err := r.db.QueryRow(ctx, query, email).Scan(
		&emp.ID,
		&emp.FullName,
		&emp.Email,
		&emp.Password,
		&emp.Role,
		&emp.JobID,
		&emp.IndexNo,
	)
	if err != nil {
		return nil, err
	}
	return &emp, nil
}

// Get all employees
func (r *EmployeeRepository) GetAll(ctx context.Context, page, limit int) ([]*Employee, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, fullname, email, password, role, jobid, indexno
	          FROM users 
			  WHERE role = 'employee'
	          ORDER BY fullname 
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	employees := make([]*Employee, 0)
	for rows.Next() {
		var emp Employee
		if err := rows.Scan(
			&emp.ID,
			&emp.FullName,
			&emp.Email,
			&emp.Password,
			&emp.Role,
			&emp.JobID,
			&emp.IndexNo,
		); err != nil {
			return nil, 0, err
		}
		employees = append(employees, &emp)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE role = 'employee'`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return employees, totalItems, nil
}


// Get all employees by job ID
func (r *EmployeeRepository) GetAllByJobId(ctx context.Context, page, limit int, jobid uuid.UUID) ([]*Employee, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, fullname, email, password, role, jobid, indexno
	          FROM users 
			  WHERE role = 'employee' AND jobid = $3
	          ORDER BY fullname 
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset, jobid)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	employees := make([]*Employee, 0)
	for rows.Next() {
		var emp Employee
		if err := rows.Scan(
			&emp.ID,
			&emp.FullName,
			&emp.Email,
			&emp.Password,
			&emp.Role,
			&emp.JobID,
			&emp.IndexNo,
		); err != nil {
			return nil, 0, err
		}
		employees = append(employees, &emp)
	}

	// total count for pagination
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE role = 'employee' AND jobid = $1`, jobid).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return employees, totalItems, nil
}


func (r *EmployeeRepository) Update(ctx context.Context, emp *Employee) (*Employee, error) {
	query := `
		UPDATE users
		SET fullname = $1, email = $2, password = $3, role = $4, jobid = $5, indexno = $6
		WHERE id = $7
		RETURNING id, fullname, email, password, role, jobid, indexno
	`

	hash, err := bcrypt.GenerateFromPassword([]byte(emp.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var updated Employee
	err = r.db.QueryRow(ctx, query,
		emp.FullName,
		emp.Email,
		hash,
		emp.Role,
		emp.JobID,
		emp.IndexNo,
		emp.ID, // sada ispravno kao $7
	).Scan(
		&updated.ID,
		&updated.FullName,
		&updated.Email,
		&updated.Password,
		&updated.Role,
		&updated.JobID,
		&updated.IndexNo,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// Delete employee
func (r *EmployeeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

// QuitJob sets jobid to NULL and changes role to 'candidate'
func (r *EmployeeRepository) QuitJob(ctx context.Context, email string) error {
	query := `
		UPDATE users
		SET jobid = NULL, role = 'candidate'
		WHERE email = $1
	`
	_, err := r.db.Exec(ctx, query, email)
	return err
}
