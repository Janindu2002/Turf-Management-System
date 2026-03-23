package repositories

import (
	"database/sql"
	"fmt"
	"turf-reservation-backend/internal/models"
)

type TeamRepository struct {
	db *sql.DB
}

func NewTeamRepository(db *sql.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

func (r *TeamRepository) CreateTeam(team *models.Team) error {
	query := `
		INSERT INTO teams (
			team_name, team_skill_level, turf_name, 
			total_member, current_member, 
			captain_name, captain_contact, looking_positions
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING team_id`

	err := r.db.QueryRow(
		query,
		team.TeamName,
		team.TeamSkillLevel,
		team.TurfName,
		team.TotalMember,
		team.CurrentMember,
		team.CaptainName,
		team.CaptainContact,
		team.LookingPositions,
	).Scan(&team.TeamID)

	if err != nil {
		return fmt.Errorf("failed to create team: %w", err)
	}
	return nil
}

func (r *TeamRepository) GetAllTeams() ([]models.Team, error) {
	query := `
		SELECT 
			team_id, team_name, team_skill_level, turf_name, 
			total_member, current_member, 
			captain_name, captain_contact, looking_positions
		FROM teams
		ORDER BY team_id DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query teams: %w", err)
	}
	defer rows.Close()

	var teams []models.Team
	for rows.Next() {
		var t models.Team
		err := rows.Scan(
			&t.TeamID,
			&t.TeamName,
			&t.TeamSkillLevel,
			&t.TurfName,
			&t.TotalMember,
			&t.CurrentMember,
			&t.CaptainName,
			&t.CaptainContact,
			&t.LookingPositions,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan team: %w", err)
		}
		teams = append(teams, t)
	}

	return teams, nil
}
