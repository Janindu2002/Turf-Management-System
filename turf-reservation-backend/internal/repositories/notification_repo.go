package repositories

import (
	"database/sql"
	"fmt"
	"turf-reservation-backend/internal/models"
)

type NotificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

// Create inserts a new notification record
func (r *NotificationRepository) Create(n *models.Notification) error {
	query := `
		INSERT INTO notifications (booking_id, user_id, message, date, type, status, retry_count, error_log)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING notification_id
	`
	err := r.db.QueryRow(
		query,
		n.BookingID,
		n.UserID,
		n.Message,
		n.Date,
		n.Type,
		n.Status,
		n.RetryCount,
		n.ErrorLog,
	).Scan(&n.NotificationID)

	if err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}
	return nil
}

// UpdateStatus updates the status and error log of a notification
func (r *NotificationRepository) UpdateStatus(id int, status, errorLog string) error {
	query := `
		UPDATE notifications
		SET status = $1, error_log = $2
		WHERE notification_id = $3
	`
	_, err := r.db.Exec(query, status, errorLog, id)
	if err != nil {
		return fmt.Errorf("failed to update notification status: %w", err)
	}
	return nil
}

// AlreadySentReminder checks if a reminder of a specific type was already sent for a booking
func (r *NotificationRepository) AlreadySentReminder(bookingID int, nType string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM notifications 
			WHERE booking_id = $1 AND type = $2 AND status = 'sent'
		)
	`
	var exists bool
	err := r.db.QueryRow(query, bookingID, nType).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check reminder status: %w", err)
	}
	return exists, nil
}

// GetUpcomingBookingsForReminder finds confirmed bookings starting in approx 24 hours
func (r *NotificationRepository) GetUpcomingBookingsForReminder() ([]*models.Booking, error) {
	// We look for bookings starting between 23 and 25 hours from now
	// and specifically check that no 'reminder' notification exists for them yet
	query := `
		SELECT b.booking_id, b.user_id, u.name as player_name, u.email as player_email,
		       TO_CHAR(ts.date, 'YYYY-MM-DD') as slot_date, 
		       TO_CHAR(ts.start_time, 'HH24:MI') as start_time,
		       t.name as turf_name
		FROM bookings b
		JOIN time_slots ts ON b.time_slot_id = ts.time_slot_id
		JOIN users u ON b.user_id = u.user_id
		JOIN turfs t ON ts.turf_id = t.turf_id
		WHERE b.status = 'confirmed'
		AND ts.start_time >= NOW() + INTERVAL '5 hours'
		AND ts.start_time <= NOW() + INTERVAL '7 hours'
		AND NOT EXISTS (
			SELECT 1 FROM notifications n 
			WHERE n.booking_id = b.booking_id AND n.type = 'reminder' AND n.status = 'sent'
		)
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch upcoming bookings for reminders: %w", err)
	}
	defer rows.Close()

	var bookings []*models.Booking
	for rows.Next() {
		b := &models.Booking{}
		err := rows.Scan(
			&b.BookingID,
			&b.UserID,
			&b.PlayerName,
			&b.PlayerEmail,
			&b.SlotDate,
			&b.StartTime,
			&b.TurfName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan booking for reminder: %w", err)
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}
