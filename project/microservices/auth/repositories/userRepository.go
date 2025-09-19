package repositories

import (
	"context"
	"errors"
	"log"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type UserRole string

const (
	RoleStudent   UserRole = "student"
	RoleProfessor UserRole = "professor"
	RoleEmployee  UserRole = "employee"
	RoleCandidate UserRole = "candidate"
)

type User struct {
	ID       uuid.UUID `json:"id"`
	FullName string    `json:"fullname"`
	Email    string    `json:"email"`
	Password string    `json:"password"`
	Role     UserRole  `json:"role"`
}

var (
	ErrEmailExists        = errors.New("email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
)

type userRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *userRepository {
	return &userRepository{db: db}
}

// Login: email + password (bcrypt)
func (r *userRepository) Login(ctx context.Context, email, password string) (*User, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	const q = `SELECT id, fullname, email, password, role FROM users WHERE email = $1`
	var u User
	if err := r.db.QueryRow(ctx, q, email).
		Scan(&u.ID, &u.FullName, &u.Email, &u.Password, &u.Role); err != nil {

		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	log.Println(bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)), " poredjenje sifre")

	if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)) != nil {
		return nil, ErrInvalidCredentials
	}
	u.Password = ""
	return &u, nil
}

// Register user in users table
func (r *userRepository) Register(ctx context.Context, u User) (*User, error) {
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))

	hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	u.ID = uuid.New()

	const insUser = `
		INSERT INTO users (id, fullname, email, password, role)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id, fullname, email, role
	`
	if err = r.db.QueryRow(ctx, insUser,
		u.ID, u.FullName, u.Email, string(hash), u.Role,
	).Scan(&u.ID, &u.FullName, &u.Email, &u.Role); err != nil {

		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrEmailExists
		}
		return nil, err
	}

	u.Password = ""
	return &u, nil
}
