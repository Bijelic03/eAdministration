package repositories

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

type UserRole string

const (
	RoleStudent   UserRole = "STUDENT"
	RoleProfessor UserRole = "PROFESSOR"
	RoleEmployee  UserRole = "EMPLOYEE"
)

type User struct {
	ID       uuid.UUID `json:"id"`
	FullName string    `json:"fullName"`
	Email    string    `json:"email"`
	Password string    `json:"password"` // hash
	Role     UserRole  `json:"role"`
}

type RegisterKind string

const (
	RegisterStudent   RegisterKind = "STUDENT"
	RegisterProfessor RegisterKind = "PROFESSOR"
	RegisterEmployee  RegisterKind = "EMPLOYEE"
)

var (
	ErrEmailExists        = errors.New("email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
)

type userRepository struct {
	db pgxpool.pool
}

func NewUserRepository(db *pgxpool.pool) (*userRepository, error) {
	return &userRepository{db: db}, nil
}

// Login: email + password (bcrypt)
func (r *userRepository) Login(ctx context.Context, email, password string) (*User, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	const q = `SELECT id, full_name, email, password, role FROM users WHERE email = $1`
	var u User
	if err := r.db.QueryRow(ctx, q, email).
		Scan(&u.ID, &u.FullName, &u.Email, &u.Password, &u.Role); err != nil {

		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)) != nil {
		return nil, ErrInvalidCredentials
	}
	u.Password = ""
	return &u, nil
}

func (r *userRepository) Register(ctx context.Context, u User, kind RegisterKind) (*User, error) {
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))

	if u.Role == "" {
		switch kind {
		case RegisterStudent:
			u.Role = RoleStudent
		case RegisterProfessor:
			u.Role = RoleProfessor
		case RegisterEmployee:
			u.Role = RoleEmployee
		default:
			return nil, errors.New("unknown register kind")
		}
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	u.ID = uuid.New()

	const insUser = `
		INSERT INTO users (id, full_name, email, password, role)
		VALUES ($1,$2,$3,$4,$5)
	`
	if _, err = tx.Exec(ctx, insUser, u.ID, u.FullName, u.Email, string(hash), u.Role); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrEmailExists
		}
		return nil, err
	}

	switch kind {
	case RegisterStudent:
		_, err = tx.Exec(ctx, `INSERT INTO students (id, user_id) VALUES ($1,$2)`, uuid.New(), u.ID)
	case RegisterProfessor:
		_, err = tx.Exec(ctx, `INSERT INTO professors (id, user_id) VALUES ($1,$2)`, uuid.New(), u.ID)
	case RegisterEmployee:
		_, err = tx.Exec(ctx, `INSERT INTO employees (id, user_id) VALUES ($1,$2)`, uuid.New(), u.ID)
	default:
		err = errors.New("unknown register kind")
	}
	if err != nil {
		return nil, err
	}

	if err = tx.Commit(ctx); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrEmailExists
		}
		return nil, err
	}

	u.Password = ""
	return &u, nil
}
