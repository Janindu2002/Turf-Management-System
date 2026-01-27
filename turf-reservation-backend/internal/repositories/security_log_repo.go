package repositories

import (
	"database/sql"
	"fmt"
	"turf-reservation-backend/internal/models"
)

type SecurityLogRepository struct {
	db *sql.DB
}

// NewSecurityLogRepository creates a new security log repository
func NewSecurityLogRepository(db *sql.DB) *SecurityLogRepository {
	return &SecurityLogRepository{db: db}
}

// Create records a new security log entry in the database
func (r *SecurityLogRepository) Create(log *models.SecurityLog) error {
	query := `
		INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, status, details)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING log_id, created_at
	`

	err := r.db.QueryRow(
		query,
		log.UserID,
		log.EventType,
		log.IPAddress,
		log.UserAgent,
		log.Status,
		log.Details,
	).Scan(&log.LogID, &log.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create security log: %w", err)
	}

	return nil
}
