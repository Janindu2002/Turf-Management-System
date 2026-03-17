package models

import "time"

// Player represents a player in the system
type Player struct {
	UserID        int       `json:"user_id"`
	TeamID        *int      `json:"team_id,omitempty"`
	SkillLevel    string    `json:"skill_level,omitempty"`
	Position      string    `json:"position,omitempty"`
	AvailableDays string    `json:"available_days,omitempty"`
	Description   string    `json:"description,omitempty"`
	IsSoloPlayer  bool      `json:"is_solo_player"`
	IsAvailable   bool      `json:"is_available"`
	UpdatedAt     time.Time `json:"updated_at,omitempty"`
}

// PlayerProfile combines User and Player data
type PlayerProfile struct {
	UserID        int    `json:"user_id"`
	TeamID        *int   `json:"team_id,omitempty"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	Phone         string `json:"phone,omitempty"`
	SkillLevel    string `json:"skill_level,omitempty"`
	Position      string `json:"position,omitempty"`
	AvailableDays string `json:"available_days"`
	Description   string `json:"description"`
	IsSoloPlayer  bool   `json:"is_solo_player"`
	IsAvailable   bool   `json:"is_available"`
}
