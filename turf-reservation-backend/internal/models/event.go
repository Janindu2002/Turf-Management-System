package models

import "time"

// Event represents an event in the system
type Event struct {
	EventID              int       `json:"event_id"`
	UserID               *int      `json:"user_id,omitempty"`
	EventName            string    `json:"event_name"`
	EventType            string    `json:"event_type"`
	StartDate            string    `json:"start_date"`
	StartTime            string    `json:"start_time"`
	EndDate              string    `json:"end_date"`
	EndTime              string    `json:"end_time"`
	ExpectedParticipants *int      `json:"expected_participants,omitempty"`
	Description          string    `json:"description,omitempty"`
	Requirements         string    `json:"requirements,omitempty"`
	Status               string    `json:"status"`
	CreatedAt            time.Time `json:"created_at"`
	// Enriched from JOIN
	PlayerName  string `json:"player_name,omitempty"`
	PlayerEmail string `json:"player_email,omitempty"`
}
