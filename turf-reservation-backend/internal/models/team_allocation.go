package models

import "time"

// TeamAllocation represents a team allocation in the system
type TeamAllocation struct {
	AllocationID int       `json:"allocation_id"`
	UserID       int       `json:"user_id"`
	EventID      int       `json:"event_id"`
	TeamID       int       `json:"team_id"`
	AllocatedAt  time.Time `json:"allocated_at"`
}
