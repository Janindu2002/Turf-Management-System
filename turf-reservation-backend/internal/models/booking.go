package models

import (
	"time"
)

// Booking represents a reservation in the system
type Booking struct {
	BookingID     int       `json:"booking_id"`
	UserID        *int      `json:"user_id,omitempty"`
	TimeSlotID    *int      `json:"time_slot_id,omitempty"`
	CoachID       *int      `json:"coach_id,omitempty"`
	EventID       *int      `json:"event_id,omitempty"`
	BookingDate   time.Time `json:"booking_date"`
	Status        string    `json:"status"`
	TotalPrice    float64   `json:"total_price"`
	PaymentStatus string    `json:"payment_status"`
	// Enriched fields from JOIN with time_slots
	SlotDate  string `json:"slot_date,omitempty"`
	StartTime string `json:"start_time,omitempty"`
	EndTime   string `json:"end_time,omitempty"`
	// Enriched fields from JOIN with users
	PlayerName  string `json:"player_name,omitempty"`
	PlayerEmail string `json:"player_email,omitempty"`
}
