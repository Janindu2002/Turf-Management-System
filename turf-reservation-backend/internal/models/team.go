package models

// Team represents a team in the system
import "time"

type Team struct {
	TeamID           int       `json:"team_id"`
	TeamName         string    `json:"team_name"`
	TeamSkillLevel   string    `json:"team_skill_level"`
	TurfName         string    `json:"turf_name"`
	TotalMember      int       `json:"total_member"`
	CurrentMember    int       `json:"current_member"`
	CaptainName      string    `json:"captain_name"`
	CaptainContact   string    `json:"captain_contact"`
	CaptainEmail     string    `json:"captain_email"`
	LookingPositions string    `json:"looking_positions"`
	PlayerIDs        []int     `json:"player_ids"`
	CreatedAt        time.Time `json:"created_at"`
}
