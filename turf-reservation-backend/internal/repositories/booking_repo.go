package repositories

import (
	"database/sql"
	"fmt"
	"turf-reservation-backend/internal/models"
)

type BookingRepository struct {
	db *sql.DB
}

// NewBookingRepository creates a new booking repository
func NewBookingRepository(db *sql.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

// Create inserts a new booking record
func (r *BookingRepository) Create(booking *models.Booking) error {
	query := `
		INSERT INTO bookings (user_id, time_slot_id, coach_id, event_id, status, coach_approval_status, admin_approval_status, total_price, payment_status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING booking_id, booking_date
	`
	err := r.db.QueryRow(
		query,
		booking.UserID,
		booking.TimeSlotID,
		booking.CoachID,
		booking.EventID,
		booking.Status,
		booking.CoachApprovalStatus,
		booking.AdminApprovalStatus,
		booking.TotalPrice,
		booking.PaymentStatus,
	).Scan(&booking.BookingID, &booking.BookingDate)

	if err != nil {
		return fmt.Errorf("failed to create booking: %w", err)
	}
	return nil
}

// GetByID retrieves a booking by its ID
func (r *BookingRepository) GetByID(id int) (*models.Booking, error) {
	query := `
		SELECT b.booking_id, b.user_id, b.time_slot_id, b.coach_id, b.event_id, b.booking_date, b.status, 
		       b.coach_approval_status, b.admin_approval_status, b.total_price, b.payment_status,
		       TO_CHAR(ts.date, 'YYYY-MM-DD'), TO_CHAR(ts.start_time, 'HH24:MI'), TO_CHAR(ts.end_time, 'HH24:MI'),
		       u.name as coach_name, t.name as turf_name
		FROM bookings b
		JOIN time_slots ts ON b.time_slot_id = ts.time_slot_id
		LEFT JOIN users u ON b.coach_id = u.user_id
		JOIN turfs t ON ts.turf_id = t.turf_id
		WHERE b.booking_id = $1
	`
	booking := &models.Booking{}
	var coachName sql.NullString
	err := r.db.QueryRow(query, id).Scan(
		&booking.BookingID,
		&booking.UserID,
		&booking.TimeSlotID,
		&booking.CoachID,
		&booking.EventID,
		&booking.BookingDate,
		&booking.Status,
		&booking.CoachApprovalStatus,
		&booking.AdminApprovalStatus,
		&booking.TotalPrice,
		&booking.PaymentStatus,
		&booking.SlotDate,
		&booking.StartTime,
		&booking.EndTime,
		&coachName,
		&booking.TurfName,
	)
	if coachName.Valid {
		booking.CoachName = coachName.String
	}

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get booking by ID: %w", err)
	}
	return booking, nil
}

// ListByUser retrieves all bookings for a specific user
func (r *BookingRepository) ListByUser(userID int) ([]*models.Booking, error) {
	query := `
		SELECT b.booking_id, b.user_id, b.time_slot_id, b.coach_id, b.event_id, b.booking_date, b.status, 
		       b.coach_approval_status, b.admin_approval_status, b.total_price, b.payment_status,
		       TO_CHAR(ts.date, 'YYYY-MM-DD'), TO_CHAR(ts.start_time, 'HH24:MI'), TO_CHAR(ts.end_time, 'HH24:MI'),
		       u.name as coach_name, t.name as turf_name
		FROM bookings b
		JOIN time_slots ts ON b.time_slot_id = ts.time_slot_id
		LEFT JOIN users u ON b.coach_id = u.user_id
		JOIN turfs t ON ts.turf_id = t.turf_id
		WHERE b.user_id = $1
		ORDER BY ts.date ASC, ts.start_time ASC
	`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list bookings by user: %w", err)
	}
	defer rows.Close()

	var bookings = []*models.Booking{}
	for rows.Next() {
		b := &models.Booking{}
		var coachName sql.NullString
		err := rows.Scan(
			&b.BookingID,
			&b.UserID,
			&b.TimeSlotID,
			&b.CoachID,
			&b.EventID,
			&b.BookingDate,
			&b.Status,
			&b.CoachApprovalStatus,
			&b.AdminApprovalStatus,
			&b.TotalPrice,
			&b.PaymentStatus,
			&b.SlotDate,
			&b.StartTime,
			&b.EndTime,
			&coachName,
			&b.TurfName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}
		if coachName.Valid {
			b.CoachName = coachName.String
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

// ListAllPending retrieves all pending bookings across all users (FIFO)
func (r *BookingRepository) ListAllPending() ([]*models.Booking, error) {
	query := `
		SELECT b.booking_id, b.user_id, b.time_slot_id, b.coach_id, b.event_id, b.booking_date, b.status, 
		       b.coach_approval_status, b.admin_approval_status, b.total_price, b.payment_status,
		       TO_CHAR(ts.date, 'YYYY-MM-DD'), TO_CHAR(ts.start_time, 'HH24:MI'), TO_CHAR(ts.end_time, 'HH24:MI'),
		       u.name, u.email, t.name as turf_name
		FROM bookings b
		JOIN time_slots ts ON b.time_slot_id = ts.time_slot_id
		JOIN users u ON b.user_id = u.user_id
		JOIN turfs t ON ts.turf_id = t.turf_id
		WHERE b.status = 'pending'
		ORDER BY b.booking_id ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list pending bookings: %w", err)
	}
	defer rows.Close()

	var bookings = []*models.Booking{}
	for rows.Next() {
		b := &models.Booking{}
		err := rows.Scan(
			&b.BookingID,
			&b.UserID,
			&b.TimeSlotID,
			&b.CoachID,
			&b.EventID,
			&b.BookingDate,
			&b.Status,
			&b.CoachApprovalStatus,
			&b.AdminApprovalStatus,
			&b.TotalPrice,
			&b.PaymentStatus,
			&b.SlotDate,
			&b.StartTime,
			&b.EndTime,
			&b.PlayerName,
			&b.PlayerEmail,
			&b.TurfName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

// Update updates an existing booking record
func (r *BookingRepository) Update(booking *models.Booking) error {
	query := `
		UPDATE bookings
		SET user_id = $1, time_slot_id = $2, coach_id = $3, event_id = $4, status = $5, 
		    coach_approval_status = $6, admin_approval_status = $7, total_price = $8, payment_status = $9
		WHERE booking_id = $10
	`
	_, err := r.db.Exec(
		query,
		booking.UserID,
		booking.TimeSlotID,
		booking.CoachID,
		booking.EventID,
		booking.Status,
		booking.CoachApprovalStatus,
		booking.AdminApprovalStatus,
		booking.TotalPrice,
		booking.PaymentStatus,
		booking.BookingID,
	)

	if err != nil {
		return fmt.Errorf("failed to update booking: %w", err)
	}
	return nil
}

// DeleteCancelled permanently deletes a cancelled booking record
func (r *BookingRepository) DeleteCancelled(bookingID int, userID int) error {
	query := `
		DELETE FROM bookings
		WHERE booking_id = $1 AND user_id = $2 AND status = 'cancelled'
	`
	result, err := r.db.Exec(query, bookingID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete booking: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("booking not found or cannot be removed (only cancelled bookings can be removed)")
	}
	return nil
}

// ListByCoach retrieves all bookings assigned to a specific coach
func (r *BookingRepository) ListByCoach(coachID int) ([]*models.Booking, error) {
	query := `
		SELECT b.booking_id, b.user_id, b.time_slot_id, b.coach_id, b.event_id, b.booking_date, b.status, 
		       b.coach_approval_status, b.admin_approval_status, b.total_price, b.payment_status,
		       TO_CHAR(ts.date, 'YYYY-MM-DD'), TO_CHAR(ts.start_time, 'HH24:MI'), TO_CHAR(ts.end_time, 'HH24:MI'),
		       u.name as player_name, u.email as player_email, t.name as turf_name
		FROM bookings b
		JOIN time_slots ts ON b.time_slot_id = ts.time_slot_id
		JOIN users u ON b.user_id = u.user_id
		JOIN turfs t ON ts.turf_id = t.turf_id
		WHERE b.coach_id = $1
		ORDER BY b.booking_date ASC
	`
	rows, err := r.db.Query(query, coachID)
	if err != nil {
		return nil, fmt.Errorf("failed to list bookings by coach: %w", err)
	}
	defer rows.Close()

	var bookings = []*models.Booking{}
	for rows.Next() {
		b := &models.Booking{}
		err := rows.Scan(
			&b.BookingID,
			&b.UserID,
			&b.TimeSlotID,
			&b.CoachID,
			&b.EventID,
			&b.BookingDate,
			&b.Status,
			&b.CoachApprovalStatus,
			&b.AdminApprovalStatus,
			&b.TotalPrice,
			&b.PaymentStatus,
			&b.SlotDate,
			&b.StartTime,
			&b.EndTime,
			&b.PlayerName,
			&b.PlayerEmail,
			&b.TurfName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}
