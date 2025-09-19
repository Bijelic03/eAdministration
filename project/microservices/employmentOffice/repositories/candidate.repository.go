// // Spremanje prijave kandidata na ponudu
// func (r *CandidateRepository) SaveApplication(candidateID string, jobID string) error {
// 	// TODO: INSERT INTO applications...
// 	return nil
// }

// // Provjera obrazovanja kandidata
// func (r *CandidateRepository) CheckEducation(candidateID string) (bool, error) {
// 	// TODO: SELECT verified FROM education_records...
// 	return true, nil
// }

package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Candidate struct {
	ID        uuid.UUID `json:"id" db:"id"`
	FullName  string    `json:"fullname" db:"fullname"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"password" db:"password"`
	Role      string    `json:"role" db:"role"`
	StudentId *string   `json:"studentid,omitempty" db:"studentid"`
}

type CandidateRepository struct {
	db *pgxpool.Pool
}

func NewCandidateRepository(db *pgxpool.Pool) *CandidateRepository {
	return &CandidateRepository{db: db}
}

// Add new Candidate
func (r *CandidateRepository) Add(ctx context.Context, cand *Candidate) (*Candidate, error) {
	query := `
		INSERT INTO users (fullname, email, password, studentid, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, fullname, email, password, studentid, role
	`

	hash, err := bcrypt.GenerateFromPassword([]byte(cand.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	cand.ID = uuid.New()
	var created Candidate

	err = r.db.QueryRow(ctx, query,
		cand.FullName,
		cand.Email,
		hash,
		cand.StudentId,
		cand.Role,
	).Scan(
		&created.ID,
		&created.FullName,
		&created.Email,
		&created.Password,
		&created.StudentId,
		&created.Role,
	)

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" { // unique_violation
				return nil, fmt.Errorf("an candidate with this email already exists")
			}
		}
		return nil, err
	}
	return &created, nil
}

// Get candidate by ID
func (r *CandidateRepository) GetByID(ctx context.Context, id uuid.UUID) (*Candidate, error) {
	query := `SELECT id, fullname, email, password, studentid, role FROM users WHERE id = $1`

	var cand Candidate
	err := r.db.QueryRow(ctx, query, id).Scan(
		&cand.ID,
		&cand.FullName,
		&cand.Email,
		&cand.Password,
		&cand.StudentId,
		&cand.Role,
	)
	if err != nil {
		return nil, err
	}
	return &cand, nil
}

// Get Candidate by email
func (r *CandidateRepository) GetByEmail(ctx context.Context, email string) (*Candidate, error) {
	query := `SELECT id, fullname, email, password, studentid, role FROM users WHERE email = $1`

	var cand Candidate
	err := r.db.QueryRow(ctx, query, email).Scan(
		&cand.ID,
		&cand.FullName,
		&cand.Email,
		&cand.Password,
		&cand.StudentId,
		&cand.Role,
	)
	if err != nil {
		return nil, err
	}
	return &cand, nil
}

// Get all candidates
func (r *CandidateRepository) GetAll(ctx context.Context, page, limit int) ([]*Candidate, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := `SELECT id, fullname, email, password, studentid, role 
	          FROM users 
			  WHERE role = 'candidate'
	          ORDER BY fullname 
	          LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	candidates := make([]*Candidate, 0)
	for rows.Next() {
		var cand Candidate
		if err := rows.Scan(
			&cand.ID,
			&cand.FullName,
			&cand.Email,
			&cand.Password,
			&cand.StudentId,
			&cand.Role,
		); err != nil {
			return nil, 0, err
		}
		candidates = append(candidates, &cand)
	}

	// total count
	var totalItems int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE role = 'candidate'`).Scan(&totalItems); err != nil {
		return nil, 0, err
	}

	return candidates, totalItems, nil
}

// Update candidate
func (r *CandidateRepository) Update(ctx context.Context, cand *Candidate) (*Candidate, error) {
	query := `
		UPDATE users
		SET fullname = $1, email = $2, password = $3, studentid = $4, role = $5
		WHERE id = $6
		RETURNING id, fullname, email, password, role, studentid
	`

	var updated Candidate
	err := r.db.QueryRow(ctx, query,
		cand.FullName,
		cand.Email,
		cand.Password,
		cand.Role,
		cand.StudentId,
		cand.ID,
	).Scan(
		&updated.ID,
		&updated.FullName,
		&updated.Email,
		&updated.Password,
		&updated.StudentId,
		&updated.Role,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// Delete candidate
func (r *CandidateRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
