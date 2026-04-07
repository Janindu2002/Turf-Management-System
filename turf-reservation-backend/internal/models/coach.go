package models

import "time"

// Coach represents a coach in the system
type Coach struct {
	UserID         int       `json:"user_id"`
	Specialization string    `json:"specialization,omitempty"`
	Availability   string    `json:"availability,omitempty"`
	HourlyRate     float64   `json:"hourly_rate"`
	Certificate    string    `json:"certificate,omitempty"`
	UpdatedAt      time.Time `json:"updated_at,omitempty"`
}
