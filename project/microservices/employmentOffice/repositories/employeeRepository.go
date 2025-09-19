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
		INSERT INTO users (fullname, email, password, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, fullname, email, password, role
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
	).Scan(
		&created.ID,
		&created.FullName,
		&created.Email,
		&created.Password,
		&created.Role,
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
	query := `SELECT id, fullname, email, password, role FROM users WHERE id = $1`

	var emp Employee
	err := r.db.QueryRow(ctx, query, id).Scan(
		&emp.ID,
		&emp.FullName,
		&emp.Email,
		&emp.Password,
		&emp.Role,
	)
	if err != nil {
		return nil, err
	}
	return &emp, nil
}

// Get employee by email
func (r *EmployeeRepository) GetByEmail(ctx context.Context, email string) (*Employee, error) {
	query := `SELECT id, fullname, email, password, role FROM users WHERE email = $1`

	var emp Employee
	err := r.db.QueryRow(ctx, query, email).Scan(
		&emp.ID,
		&emp.FullName,
		&emp.Email,
		&emp.Password,
		&emp.Role,
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

	query := `SELECT id, fullname, email, password, role 
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

// Update employee
func (r *EmployeeRepository) Update(ctx context.Context, emp *Employee) (*Employee, error) {
	query := `
		UPDATE users
		SET fullname = $1, email = $2, password = $3, role = $4
		WHERE id = $5
		RETURNING id, fullname, email, password, role
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
		emp.ID,
	).Scan(
		&updated.ID,
		&updated.FullName,
		&updated.Email,
		&updated.Password,
		&updated.Role,
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
