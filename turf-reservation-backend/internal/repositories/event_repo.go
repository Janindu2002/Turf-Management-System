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
		INSERT INTO events (user_id, event_name, event_type, start_date, start_time, end_date, expected_participants, description, requirements, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
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
		event.ExpectedParticipants,
		event.Description,
		event.Requirements,
	).Scan(&event.EventID, &event.CreatedAt)
}

// ListAllPending retrieves all pending events in FIFO order, joined with player info
func (r *EventRepository) ListAllPending() ([]*models.Event, error) {
	query := `
		SELECT e.event_id, e.user_id, e.event_name, e.event_type,
		       TO_CHAR(e.start_date, 'YYYY-MM-DD'), TO_CHAR(e.start_time, 'HH24:MI'),
		       TO_CHAR(e.end_date, 'YYYY-MM-DD'),
		       e.expected_participants, e.description, e.requirements, e.status, e.created_at,
		       u.name, u.email
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
		       TO_CHAR(end_date, 'YYYY-MM-DD'),
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
