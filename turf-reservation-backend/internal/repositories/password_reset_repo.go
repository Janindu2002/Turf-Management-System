package repositories

import (
	"database/sql"
	"fmt"
	"time"
	"turf-reservation-backend/internal/models"
)

type PasswordResetRepository struct {
	db *sql.DB
}

func NewPasswordResetRepository(db *sql.DB) *PasswordResetRepository {
	return &PasswordResetRepository{db: db}
}

// CreateToken saves a new password reset token in the database
func (r *PasswordResetRepository) CreateToken(userID int, token string, expiresAt time.Time) error {
	// First, delete any existing tokens for this user
	_, err := r.db.Exec("DELETE FROM password_reset_tokens WHERE user_id = $1", userID)
	if err != nil {
		return fmt.Errorf("failed to delete old tokens: %w", err)
	}

	query := `
		INSERT INTO password_reset_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)
	`
	_, err = r.db.Exec(query, userID, token, expiresAt)
	if err != nil {
		return fmt.Errorf("failed to create reset token: %w", err)
	}
	return nil
}

// GetByToken retrieves a token record by the token string
func (r *PasswordResetRepository) GetByToken(token string) (*models.PasswordResetToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, created_at
		FROM password_reset_tokens
		WHERE token = $1
	`
	t := &models.PasswordResetToken{}
	err := r.db.QueryRow(query, token).Scan(
		&t.ID,
		&t.UserID,
		&t.Token,
		&t.ExpiresAt,
		&t.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("token not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get token: %w", err)
	}
	return t, nil
}

// DeleteToken removes a token from the database
func (r *PasswordResetRepository) DeleteToken(token string) error {
	query := "DELETE FROM password_reset_tokens WHERE token = $1"
	_, err := r.db.Exec(query, token)
	if err != nil {
		return fmt.Errorf("failed to delete token: %w", err)
	}
	return nil
}

// DeleteByUserID removes all tokens for a user
func (r *PasswordResetRepository) DeleteByUserID(userID int) error {
	query := "DELETE FROM password_reset_tokens WHERE user_id = $1"
	_, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user tokens: %w", err)
	}
	return nil
}
