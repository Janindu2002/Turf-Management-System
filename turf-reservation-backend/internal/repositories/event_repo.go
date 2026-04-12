package repositories

import (
	"database/sql"
	"fmt"

	"turf-reservation-backend/internal/models"
)

type EventRepository struct {
	db *sql.DB
}

func NewEventRepository(db *sql.DB) *EventRepository {
	return &EventRepository{db: db}
}

// Create inserts a new event and returns the created record
func (r *EventRepository) Create(event *models.Event) error {
	query := `
		INSERT INTO events (user_id, event_name, event_type, start_date, start_time, end_date, end_time, expected_participants, description, requirements, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
		RETURNING event_id, created_at
	`
	return r.db.QueryRow(
		query,
		event.UserID,
		event.EventName,
		event.EventType,
		event.StartDate,
		event.StartTime,
		event.EndDate,
		event.EndTime,
		event.ExpectedParticipants,
		event.Description,
		event.Requirements,
	).Scan(&event.EventID, &event.CreatedAt)
}

// ListAllPending retrieves all pending events in FIFO order, joined with player info
func (r *EventRepository) ListAllPending() ([]*models.Event, error) {
	query := `
		SELECT e.event_id, e.user_id, COALESCE(e.event_name, ''), COALESCE(e.event_type, 'Friendly Match'),
		       TO_CHAR(e.start_date, 'YYYY-MM-DD'), COALESCE(TO_CHAR(e.start_time, 'HH24:MI'), ''),
		       TO_CHAR(e.end_date, 'YYYY-MM-DD'), COALESCE(TO_CHAR(e.end_time, 'HH24:MI'), ''),
		       e.expected_participants, COALESCE(e.description, ''), COALESCE(e.requirements, ''), e.status, e.created_at,
		       COALESCE(u.name, 'Anonymous'), COALESCE(u.email, '')
		FROM events e
		JOIN users u ON e.user_id = u.user_id
		WHERE e.status = 'pending'
		ORDER BY e.event_id ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list pending events: %w", err)
	}
	defer rows.Close()

	var events = []*models.Event{}
	for rows.Next() {
		ev := &models.Event{}
		err := rows.Scan(
			&ev.EventID,
			&ev.UserID,
			&ev.EventName,
			&ev.EventType,
			&ev.StartDate,
			&ev.StartTime,
			&ev.EndDate,
			&ev.EndTime,
			&ev.ExpectedParticipants,
			&ev.Description,
			&ev.Requirements,
			&ev.Status,
			&ev.CreatedAt,
			&ev.PlayerName,
			&ev.PlayerEmail,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, ev)
	}
	return events, nil
}

// ListAll retrieves all events for admins (pending, approved, rejected)
func (r *EventRepository) ListAll() ([]*models.Event, error) {
	query := `
		SELECT e.event_id, e.user_id, COALESCE(e.event_name, ''), COALESCE(e.event_type, 'Friendly Match'),
		       TO_CHAR(e.start_date, 'YYYY-MM-DD'), COALESCE(TO_CHAR(e.start_time, 'HH24:MI'), ''),
		       TO_CHAR(e.end_date, 'YYYY-MM-DD'), COALESCE(TO_CHAR(e.end_time, 'HH24:MI'), ''),
		       e.expected_participants, COALESCE(e.description, ''), COALESCE(e.requirements, ''), e.status, e.created_at,
		       COALESCE(u.name, 'Anonymous'), COALESCE(u.email, '')
		FROM events e
		JOIN users u ON e.user_id = u.user_id
		ORDER BY e.event_id DESC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list all events: %w", err)
	}
	defer rows.Close()

	var events = []*models.Event{}
	for rows.Next() {
		ev := &models.Event{}
		err := rows.Scan(
			&ev.EventID,
			&ev.UserID,
			&ev.EventName,
			&ev.EventType,
			&ev.StartDate,
			&ev.StartTime,
			&ev.EndDate,
			&ev.EndTime,
			&ev.ExpectedParticipants,
			&ev.Description,
			&ev.Requirements,
			&ev.Status,
			&ev.CreatedAt,
			&ev.PlayerName,
			&ev.PlayerEmail,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, ev)
	}
	return events, nil
}

// ListByUserID retrieves all events for a specific user
func (r *EventRepository) ListByUserID(userID int) ([]*models.Event, error) {
	query := `
		SELECT event_id, user_id, event_name, event_type,
		       TO_CHAR(start_date, 'YYYY-MM-DD'), TO_CHAR(start_time, 'HH24:MI'),
		       TO_CHAR(end_date, 'YYYY-MM-DD'), COALESCE(TO_CHAR(end_time, 'HH24:MI'), ''),
		       expected_participants, description, requirements, status, created_at
		FROM events
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list user events: %w", err)
	}
	defer rows.Close()

	var events = []*models.Event{}
	for rows.Next() {
		ev := &models.Event{}
		err := rows.Scan(
			&ev.EventID,
			&ev.UserID,
			&ev.EventName,
			&ev.EventType,
			&ev.StartDate,
			&ev.StartTime,
			&ev.EndDate,
			&ev.EndTime,
			&ev.ExpectedParticipants,
			&ev.Description,
			&ev.Requirements,
			&ev.Status,
			&ev.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, ev)
	}
	return events, nil
}

// UpdateStatus sets the status of an event (approved / rejected)
func (r *EventRepository) UpdateStatus(eventID int, status string) error {
	query := `UPDATE events SET status = $1 WHERE event_id = $2`
	result, err := r.db.Exec(query, status, eventID)
	if err != nil {
		return fmt.Errorf("failed to update event status: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("event not found")
	}
	return nil
}

// GetByID retrieves a specific event by its ID
func (r *EventRepository) GetByID(id int) (*models.Event, error) {
	query := `
		SELECT event_id, user_id, event_name, event_type,
		       TO_CHAR(start_date, 'YYYY-MM-DD'), TO_CHAR(start_time, 'HH24:MI'),
		       TO_CHAR(end_date, 'YYYY-MM-DD'), COALESCE(TO_CHAR(end_time, 'HH24:MI'), ''),
		       expected_participants, description, requirements, status, created_at
		FROM events
		WHERE event_id = $1
	`
	ev := &models.Event{}
	err := r.db.QueryRow(query, id).Scan(
		&ev.EventID,
		&ev.UserID,
		&ev.EventName,
		&ev.EventType,
		&ev.StartDate,
		&ev.StartTime,
		&ev.EndDate,
		&ev.EndTime,
		&ev.ExpectedParticipants,
		&ev.Description,
		&ev.Requirements,
		&ev.Status,
		&ev.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get event by ID: %w", err)
	}
	return ev, nil
}

// DeleteRejected permanently deletes a rejected event record
func (r *EventRepository) DeleteRejected(eventID int, userID int) error {
	query := `
		DELETE FROM events
		WHERE event_id = $1 AND user_id = $2 AND status IN ('rejected', 'cancelled')
	`
	result, err := r.db.Exec(query, eventID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("event not found or cannot be removed (only rejected or cancelled events can be removed)")
	}
	return nil
}
