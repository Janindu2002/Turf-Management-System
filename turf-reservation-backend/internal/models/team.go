package models

// Team represents a team in the system
type Team struct {
	TeamID           int    `json:"team_id"`
	TeamName         string `json:"team_name"`
	TeamSkillLevel   string `json:"team_skill_level"`
	TurfName         string `json:"turf_name"`
	TotalMember      int    `json:"total_member"`
	CurrentMember    int    `json:"current_member"`
	CaptainName      string `json:"captain_name"`
	CaptainContact   string `json:"captain_contact"`
	LookingPositions string `json:"looking_positions"`
}
