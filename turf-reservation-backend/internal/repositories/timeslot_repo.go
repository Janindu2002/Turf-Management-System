package repositories

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/lib/pq"
	"turf-reservation-backend/internal/models"
)

type TimeSlotRepository struct {
	db *sql.DB
}

// NewTimeSlotRepository creates a new timeslot repository
func NewTimeSlotRepository(db *sql.DB) *TimeSlotRepository {
	return &TimeSlotRepository{db: db}
}

// GetByDate retrieves available slots for a specific date, generating them if they don't exist
func (r *TimeSlotRepository) GetByDate(date string) ([]*models.TimeSlot, error) {
	// Ensure slots exist for this date before querying
	if err := r.EnsureSlotsExistForDate(date); err != nil {
		return nil, fmt.Errorf("failed to ensure slots exist for date %s: %w", date, err)
	}

	query := `
		SELECT time_slot_id, turf_id, start_time, end_time, date, status, COALESCE(blocked_reason, '')
		FROM time_slots
		WHERE date = $1
		ORDER BY start_time ASC
	`

	rows, err := r.db.Query(query, date)
	if err != nil {
		return nil, fmt.Errorf("failed to get slots for date %s: %w", date, err)
	}
	defer rows.Close()

	var slots = []*models.TimeSlot{}
	for rows.Next() {
		slot := &models.TimeSlot{}
		err := rows.Scan(
			&slot.TimeSlotID,
			&slot.TurfID,
			&slot.StartTime,
			&slot.EndTime,
			&slot.Date,
			&slot.Status,
			&slot.BlockedReason,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan slot: %w", err)
		}
		slots = append(slots, slot)
	}

	return slots, nil
}

// EnsureSlotsExist checks and creates slots for the next 7 days
func (r *TimeSlotRepository) EnsureSlotsExist() error {
	now := time.Now()
	for i := 0; i <= 7; i++ {
		currentDate := now.AddDate(0, 0, i)
		dateStr := currentDate.Format("2006-01-02")
		if err := r.EnsureSlotsExistForDate(dateStr); err != nil {
			return err
		}
	}
	return nil
}

// EnsureSlotsExistForDate ensures slots exist for a specific date
func (r *TimeSlotRepository) EnsureSlotsExistForDate(dateStr string) error {
	// We'll hardcode turf_id = 1 for now or use a constant if you have multiple turfs
	const defaultTurfID = 1

	// Check if slots already exist for this date
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM time_slots WHERE date = $1", dateStr).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check existing slots for %s: %w", dateStr, err)
	}

	if count > 0 {
		return nil
	}

	// Parse the date to get correct day parts
	datePart, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return fmt.Errorf("invalid date format: %w", err)
	}

	// Generate slots from 8 AM to 9 PM (21:00)
	for hour := 8; hour < 21; hour++ {
		startTime := time.Date(datePart.Year(), datePart.Month(), datePart.Day(), hour, 0, 0, 0, time.Local)
		endTime := startTime.Add(time.Hour)

		// Determine initial status based on approved events
		status := "available"
		var eventName string
		// Check if any approved event covers this slot
		eventCheckQuery := `
			SELECT event_name FROM events 
			WHERE status = 'approved' 
			AND start_date <= $1 AND end_date >= $1
			AND start_time::time <= $2 AND end_time::time > $2
			LIMIT 1
		`
		slotTimeStr := startTime.Format("15:04:05")
		err := r.db.QueryRow(eventCheckQuery, dateStr, slotTimeStr).Scan(&eventName)
		if err == nil && eventName != "" {
			status = "booked"
		}

		_, err = r.db.Exec(`
			INSERT INTO time_slots (turf_id, start_time, end_time, date, status, blocked_reason)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (turf_id, date, start_time) DO NOTHING
		`, defaultTurfID, startTime, endTime, dateStr, status, eventName)

		if err != nil {
			return fmt.Errorf("failed to create slot for %s %d:00: %w", dateStr, hour, err)
		}
	}

	return nil
}

// UpdateStatus updates the status of a specific timeslot
func (r *TimeSlotRepository) UpdateStatus(id int, status string) error {
	var query string
	if status == "available" {
		query = `UPDATE time_slots SET status = $1, blocked_reason = '' WHERE time_slot_id = $2`
	} else {
		query = `UPDATE time_slots SET status = $1 WHERE time_slot_id = $2`
	}

	_, err := r.db.Exec(query, status, id)
	if err != nil {
		return fmt.Errorf("failed to update timeslot status: %w", err)
	}
	return nil
}

// GetByID retrieves a timeslot by its ID
func (r *TimeSlotRepository) GetByID(id int) (*models.TimeSlot, error) {
	query := `
		SELECT time_slot_id, turf_id, start_time, end_time, date, status, COALESCE(blocked_reason, '')
		FROM time_slots
		WHERE time_slot_id = $1
	`
	slot := &models.TimeSlot{}
	err := r.db.QueryRow(query, id).Scan(
		&slot.TimeSlotID,
		&slot.TurfID,
		&slot.StartTime,
		&slot.EndTime,
		&slot.Date,
		&slot.Status,
		&slot.BlockedReason,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get timeslot by ID: %w", err)
	}
	return slot, nil
}

// BlockSlotsForEvent marks slots within a date/time range as 'booked' and sets the reason
func (r *TimeSlotRepository) BlockSlotsForEvent(startDate, startTime, endDate, endTime, eventName string) error {
	query := `
		UPDATE time_slots 
		SET status = 'booked', blocked_reason = $5
		WHERE date >= $1 AND date <= $2
		AND start_time::time >= $3 AND start_time::time < $4
	`
	_, err := r.db.Exec(query, startDate, endDate, startTime, endTime, eventName)
	return err
}

// BlockMultipleSlots marks specific slots as 'blocked' with a reason
func (r *TimeSlotRepository) BlockMultipleSlots(ids []int, reason string) error {
	if len(ids) == 0 {
		return nil
	}

	// Use ANY($1) for batch update in PostgreSQL
	// If IDs are [1, 2, 3], query becomes WHERE time_slot_id = ANY('{1,2,3}')
	query := `
		UPDATE time_slots 
		SET status = 'blocked', blocked_reason = $2
		WHERE time_slot_id = ANY($1)
		AND status != 'booked'
	`

	// Transform []int to a format compatible with ANY ($1)
	// PostgreSQL driver (lib/pq) requires pq.Array(ids)
	_, err := r.db.Exec(query, pq.Array(ids), reason)
	if err != nil {
		return fmt.Errorf("failed to block slots: %w", err)
	}
	return nil
}

// UnblockSlot resets a slot to 'available'
func (r *TimeSlotRepository) UnblockSlot(id int) error {
	query := `
		UPDATE time_slots 
		SET status = 'available', blocked_reason = ''
		WHERE time_slot_id = $1 AND status = 'blocked'
	`
	_, err := r.db.Exec(query, id)
	return err
}
// ReleaseSlotsForEvent resets slots within a range back to 'available' if they were booked for this specific event
func (r *TimeSlotRepository) ReleaseSlotsForEvent(startDate, startTime, endDate, endTime, eventName string) error {
	query := `
		UPDATE time_slots 
		SET status = 'available', blocked_reason = ''
		WHERE date >= $1 AND date <= $2
		AND start_time::time >= $3 AND start_time::time < $4
		AND blocked_reason = $5
	`
	_, err := r.db.Exec(query, startDate, endDate, startTime, endTime, eventName)
	return err
}
