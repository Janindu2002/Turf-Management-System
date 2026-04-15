package repositories

import (
	"database/sql"
	"fmt"
	"time"
	"turf-reservation-backend/internal/models"
)

type EmailVerificationRepository struct {
	db *sql.DB
}

func NewEmailVerificationRepository(db *sql.DB) *EmailVerificationRepository {
	return &EmailVerificationRepository{db: db}
}

// Create saves a new email verification record
func (r *EmailVerificationRepository) Create(email, otp string, expiresAt time.Time) error {
	// Delete any existing verification records for this email
	_, err := r.db.Exec("DELETE FROM email_verifications WHERE email = $1", email)
	if err != nil {
		return fmt.Errorf("failed to delete old verification records: %w", err)
	}

	query := `
		INSERT INTO email_verifications (email, otp, expires_at)
		VALUES ($1, $2, $3)
	`
	_, err = r.db.Exec(query, email, otp, expiresAt)
	if err != nil {
		return fmt.Errorf("failed to create verification record: %w", err)
	}
	return nil
}

// GetLatestByEmail retrieves the latest verification record for an email
func (r *EmailVerificationRepository) GetLatestByEmail(email string) (*models.EmailVerification, error) {
	query := `
		SELECT id, email, otp, expires_at, created_at
		FROM email_verifications
		WHERE email = $1
		ORDER BY created_at DESC
		LIMIT 1
	`
	v := &models.EmailVerification{}
	err := r.db.QueryRow(query, email).Scan(
		&v.ID,
		&v.Email,
		&v.OTP,
		&v.ExpiresAt,
		&v.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("verification record not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get verification record: %w", err)
	}
	return v, nil
}

// DeleteByEmail removes all verification records for an email
func (r *EmailVerificationRepository) DeleteByEmail(email string) error {
	query := "DELETE FROM email_verifications WHERE email = $1"
	_, err := r.db.Exec(query, email)
	if err != nil {
		return fmt.Errorf("failed to delete verification records: %w", err)
	}
	return nil
}
