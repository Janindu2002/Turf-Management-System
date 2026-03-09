package models

// Turf represents a turf in the system
type Turf struct {
	TurfID   int    `json:"turf_id"`
	Name     string `json:"name"`
	Location string `json:"location"`
	Type     string `json:"type"`
}
