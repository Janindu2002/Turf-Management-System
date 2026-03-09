package models

import "time"

// TimeSlot represents a booking slot for a turf
type TimeSlot struct {
	TimeSlotID    int       `json:"time_slot_id"`
	TurfID        int       `json:"turf_id"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
	Date          time.Time `json:"date"`
	Status        string    `json:"status"`
	BlockedReason string    `json:"blocked_reason,omitempty"`
}

// TimeSlotResponse represents the JSON structure for timeslot response
type TimeSlotResponse struct {
	TimeSlotID    int    `json:"time_slot_id"`
	TurfID        int    `json:"turf_id"`
	StartTime     string `json:"start_time"`
	EndTime       string `json:"end_time"`
	Date          string `json:"date"`
	Status        string `json:"status"`
	BlockedReason string `json:"blocked_reason,omitempty"`
}

// ToResponse converts TimeSlot model to Response struct
func (t *TimeSlot) ToResponse() TimeSlotResponse {
	return TimeSlotResponse{
		TimeSlotID:    t.TimeSlotID,
		TurfID:        t.TurfID,
		StartTime:     t.StartTime.Format("15:04"),
		EndTime:       t.EndTime.Format("15:04"),
		Date:          t.Date.Format("2006-01-02"),
		Status:        t.Status,
		BlockedReason: t.BlockedReason,
	}
}
