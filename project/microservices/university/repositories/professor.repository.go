package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Professor struct {
	ID       uuid.UUID `json:"id" db:"id"`
	FullName string    `json:"fullname" db:"fullname"`
	Email    string    `json:"email" db:"email"`
	Password string    `json:"password" db:"password"`
	Role     string    `json:"role" db:"role"`
}

type ProfessorRepository struct {
	db *pgxpool.Pool
}

func NewProfessorRepository(db *pgxpool.Pool) *ProfessorRepository {
	return &ProfessorRepository{db: db}
}

// Add new Professor
func (r *ProfessorRepository) Add(ctx context.Context, prof *Professor) (*Professor, error) {
	query := `
		INSERT INTO users (fullname, email, password, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, fullname, email, password, role
	`

	hash, err := bcrypt.GenerateFromPassword([]byte(prof.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	prof.ID = uuid.New()
	var created Professor

	err = r.db.QueryRow(ctx, query,
		prof.FullName,
		prof.Email,
		hash,
		prof.Role,
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
				return nil, fmt.Errorf("an professor with this email already exists")
			}
		}
		return nil, err
	}
	return &created, nil
}

// Get professor by ID
func (r *ProfessorRepository) GetByID(ctx context.Context, id uuid.UUID) (*Professor, error) {
	query := `SELECT id, fullname, email, password, role FROM users WHERE id = $1`

	var prof Professor
	err := r.db.QueryRow(ctx, query, id).Scan(
		&prof.ID,
		&prof.FullName,
		&prof.Email,
		&prof.Password,
		&prof.Role,
	)
	if err != nil {
		return nil, err
	}
	return &prof, nil
}

// Get professor by email
func (r *ProfessorRepository) GetByEmail(ctx context.Context, email string) (*Professor, error) {
	query := `SELECT id, fullname, email, password, role FROM users WHERE email = $1`

	var prof Professor
	err := r.db.QueryRow(ctx, query, email).Scan(
		&prof.ID,
		&prof.FullName,
		&prof.Email,
		&prof.Password,
		&prof.Role,
	)
	if err != nil {
		return nil, err
	}
	return &prof, nil
}

// Get all professor
func (r *ProfessorRepository) GetAll(ctx context.Context, page, limit int) ([]*Professor, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, fullname, email, password, role 
	          FROM users 
			  WHERE role = 'professor'
	          ORDER BY fullname 
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	professors := make([]*Professor, 0)
	for rows.Next() {
		var prof Professor
		if err := rows.Scan(
			&prof.ID,
			&prof.FullName,
			&prof.Email,
			&prof.Password,
			&prof.Role,
		); err != nil {
			return nil, 0, err
		}
		professors = append(professors, &prof)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE role = 'professor'`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return professors, totalItems, nil
}

// Update professor
func (r *ProfessorRepository) Update(ctx context.Context, prof *Professor) (*Professor, error) {
	query := `
		UPDATE users
		SET fullname = $1, email = $2, password = $3, role = $4
		WHERE id = $5
		RETURNING id, fullname, email, password, role
	`

	hash, err := bcrypt.GenerateFromPassword([]byte(prof.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var updated Professor
	err = r.db.QueryRow(ctx, query,
		prof.FullName,
		prof.Email,
		hash,
		prof.Role,
		prof.ID,
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

// Delete professor
func (r *ProfessorRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
