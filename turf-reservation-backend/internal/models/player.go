package models

// Player represents a player in the system
type Player struct {
	UserID       int    `json:"user_id"`
	TeamID       *int   `json:"team_id,omitempty"`
	SkillLevel   string `json:"skill_level,omitempty"`
	Position     string `json:"position,omitempty"`
	IsSoloPlayer bool   `json:"is_solo_player"`
}
