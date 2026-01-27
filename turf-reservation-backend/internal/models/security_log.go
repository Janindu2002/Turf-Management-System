package models

import "time"

// SecurityLog represents an audit log entry in the security_logs table
type SecurityLog struct {
	LogID     int       `json:"log_id"`
	UserID    *int      `json:"user_id,omitempty"` // Nullable if event is pre-login
	EventType string    `json:"event_type"`        // login, registration, logout, failed_login, password_change
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
	Status    string    `json:"status"` // success, failure
	Details   string    `json:"details"`
	CreatedAt time.Time `json:"created_at"`
}
