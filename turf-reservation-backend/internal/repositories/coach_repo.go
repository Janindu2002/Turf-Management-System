package repositories

import (
	"database/sql"
	"fmt"
	"turf-reservation-backend/internal/models"
)

type CoachRepository struct {
	db *sql.DB
}

func NewCoachRepository(db *sql.DB) *CoachRepository {
	return &CoachRepository{db: db}
}

func (r *CoachRepository) GetCoachByUserID(userID int) (*models.Coach, error) {
	query := `
		SELECT user_id, COALESCE(specialization,''), COALESCE(availability,''), hourly_rate, COALESCE(certificate,''), updated_at
		FROM coaches
		WHERE user_id = $1
	`
	coach := &models.Coach{}
	err := r.db.QueryRow(query, userID).Scan(
		&coach.UserID,
		&coach.Specialization,
		&coach.Availability,
		&coach.HourlyRate,
		&coach.Certificate,
		&coach.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get coach by user ID: %w", err)
	}
	return coach, nil
}

func (r *CoachRepository) UpsertCoach(coach *models.Coach) error {
	query := `
		INSERT INTO coaches (user_id, specialization, availability, hourly_rate, certificate)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE
		SET specialization = EXCLUDED.specialization,
		    availability = EXCLUDED.availability,
		    hourly_rate = EXCLUDED.hourly_rate,
		    certificate = EXCLUDED.certificate
	`
	_, err := r.db.Exec(
		query,
		coach.UserID,
		coach.Specialization,
		coach.Availability,
		coach.HourlyRate,
		coach.Certificate,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert coach: %w", err)
	}
	return nil
}

// UpdateCoachProfile updates mutable profile fields (specialization, availability, hourly_rate).
// Certificate is not changed here.
func (r *CoachRepository) UpdateCoachProfile(userID int, specialization, availability string, hourlyRate float64) error {
	query := `
		UPDATE coaches
		SET specialization = $1,
		    availability   = $2,
		    hourly_rate    = $3
		WHERE user_id = $4
	`
	result, err := r.db.Exec(query, specialization, availability, hourlyRate, userID)
	if err != nil {
		return fmt.Errorf("failed to update coach profile: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("coach record not found")
	}
	return nil
}

// CoachPublicProfile is what players see when browsing coaches
type CoachPublicProfile struct {
	UserID         int     `json:"user_id"`
	Name           string  `json:"name"`
	Email          string  `json:"email"`
	Specialization string  `json:"specialization"`
	Availability   string  `json:"availability"`
	HourlyRate     float64 `json:"hourly_rate"`
}

// GetAllCoaches returns all coaches with their public profile data
func (r *CoachRepository) GetAllCoaches() ([]CoachPublicProfile, error) {
	query := `
		SELECT u.user_id, u.name, u.email,
		       COALESCE(c.specialization, ''),
		       COALESCE(c.availability, ''),
		       COALESCE(c.hourly_rate, 0)
		FROM users u
		JOIN coaches c ON u.user_id = c.user_id
		WHERE u.role = 'coach'
		ORDER BY u.name ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get coaches: %w", err)
	}
	defer rows.Close()

	var coaches []CoachPublicProfile
	for rows.Next() {
		var p CoachPublicProfile
		err := rows.Scan(&p.UserID, &p.Name, &p.Email, &p.Specialization, &p.Availability, &p.HourlyRate)
		if err != nil {
			return nil, fmt.Errorf("failed to scan coach: %w", err)
		}
		coaches = append(coaches, p)
	}
	return coaches, nil
}

// CoachAdminProfile is used by admins to see full coach details
type CoachAdminProfile struct {
	UserID         int     `json:"user_id"`
	Name           string  `json:"name"`
	Email          string  `json:"email"`
	Phone          string  `json:"phone"`
	Specialization string  `json:"specialization"`
	Availability   string  `json:"availability"`
	HourlyRate     float64 `json:"hourly_rate"`
	Certificate    string  `json:"certificate"`
	LastLogin      string  `json:"last_login"`
}

// GetAllCoachesAdmin returns all coaches with full details for admin view
func (r *CoachRepository) GetAllCoachesAdmin() ([]CoachAdminProfile, error) {
	query := `
		SELECT
			u.user_id,
			u.name,
			u.email,
			COALESCE(u.phone, ''),
			COALESCE(c.specialization, ''),
			COALESCE(c.availability, ''),
			COALESCE(c.hourly_rate, 0),
			COALESCE(c.certificate, ''),
			COALESCE(
				(SELECT TO_CHAR(sl.created_at, 'YYYY-MM-DD HH12:MI AM')
				 FROM security_logs sl
				 WHERE sl.user_id = u.user_id
				   AND sl.event_type = 'login'
				   AND sl.status = 'success'
				 ORDER BY sl.created_at DESC
				 LIMIT 1),
				'Never'
			)
		FROM users u
		JOIN coaches c ON u.user_id = c.user_id
		WHERE u.role = 'coach'
		ORDER BY u.name ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get admin coaches: %w", err)
	}
	defer rows.Close()

	var coaches []CoachAdminProfile
	for rows.Next() {
		var p CoachAdminProfile
		err := rows.Scan(
			&p.UserID, &p.Name, &p.Email, &p.Phone,
			&p.Specialization, &p.Availability, &p.HourlyRate,
			&p.Certificate, &p.LastLogin,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan admin coach: %w", err)
		}
		coaches = append(coaches, p)
	}
	return coaches, nil
}
