package model

import (
	"time"

	"github.com/google/uuid"
)

type Candidate struct {
	ID        uuid.UUID  `json:"id"         db:"id"`
	StudentID *uuid.UUID `json:"studentId"  db:"student_id"` // ako je kandidat student, inače NULL
	FullName  string     `json:"fullName"   db:"full_name"`
	Email     string     `json:"email"      db:"email"`
	CreatedAt time.Time  `json:"createdAt"  db:"created_at"`
	UpdatedAt time.Time  `json:"updatedAt"  db:"updated_at"`

	EducationRecords []EducationRecord `json:"educationRecords" db:"-"`
	Applications     []Application     `json:"applications"     db:"-"`
}
