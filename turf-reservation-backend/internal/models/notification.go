package models

import "time"

// Notification represents a notification in the system
type Notification struct {
	NotificationID int       `json:"notification_id"`
	BookingID      *int      `json:"booking_id,omitempty"`
	UserID         *int      `json:"user_id,omitempty"`
	Message        string    `json:"message"`
	Date           time.Time `json:"date"`
	Type           string    `json:"type"`
	Status         string    `json:"status"`
	RetryCount     int       `json:"retry_count"`
	ErrorLog       string    `json:"error_log,omitempty"`
}
