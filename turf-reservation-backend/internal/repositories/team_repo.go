package repositories

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"turf-reservation-backend/internal/models"
)

type TeamRepository struct {
	db *sql.DB
}

func NewTeamRepository(db *sql.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

var (
	ErrTeamNotFound  = errors.New("team not found")
	ErrTeamFull      = errors.New("team is full")
	ErrPlayerHasTeam = errors.New("player already belongs to a team")
)

func (r *TeamRepository) CreateTeam(team *models.Team) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer tx.Rollback()

	query := `
		INSERT INTO teams (
			team_name, team_skill_level, turf_name, 
			total_member, current_member, 
			captain_name, captain_contact, captain_email, looking_positions
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING team_id`

	err = tx.QueryRow(
		query,
		team.TeamName,
		team.TeamSkillLevel,
		team.TurfName,
		team.TotalMember,
		team.CurrentMember,
		team.CaptainName,
		team.CaptainContact,
		team.CaptainEmail,
		team.LookingPositions,
	).Scan(&team.TeamID)

	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") && strings.Contains(err.Error(), "teams_team_name_key") {
			return fmt.Errorf("a team with the name '%s' already exists", team.TeamName)
		}
		log.Printf("[TeamRepository] CreateTeam error: %v", err)
		return fmt.Errorf("failed to insert team: %w", err)
	}

	log.Printf("[TeamRepository] Team created with ID: %d", team.TeamID)

	// Update players assigned to this team
	if len(team.PlayerIDs) > 0 {
		updatePlayerQuery := `
			INSERT INTO players (user_id, team_id, has_team, is_solo_player)
			VALUES ($1, $2, true, false)
			ON CONFLICT (user_id) DO UPDATE
			SET team_id = EXCLUDED.team_id,
			    has_team = EXCLUDED.has_team,
			    is_solo_player = EXCLUDED.is_solo_player`

		for _, playerID := range team.PlayerIDs {
			_, err = tx.Exec(updatePlayerQuery, playerID, team.TeamID)
			if err != nil {
				return fmt.Errorf("failed to update player %d: %w", playerID, err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *TeamRepository) JoinTeam(teamID, playerUserID int) (*models.Team, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	var team models.Team
	query := `
		SELECT team_id, team_name, team_skill_level, turf_name, total_member, current_member, captain_name, captain_contact, captain_email, looking_positions
		FROM teams
		WHERE team_id = $1
		FOR UPDATE`

	err = tx.QueryRow(query, teamID).Scan(
		&team.TeamID,
		&team.TeamName,
		&team.TeamSkillLevel,
		&team.TurfName,
		&team.TotalMember,
		&team.CurrentMember,
		&team.CaptainName,
		&team.CaptainContact,
		&team.CaptainEmail,
		&team.LookingPositions,
	)
	if err == sql.ErrNoRows {
		return nil, ErrTeamNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch team: %w", err)
	}

	if team.CurrentMember >= team.TotalMember {
		return nil, ErrTeamFull
	}

	var hasTeam bool
	err = tx.QueryRow(`SELECT COALESCE(has_team, false) FROM players WHERE user_id = $1 FOR UPDATE`, playerUserID).Scan(&hasTeam)
	if err != nil {
		if err != sql.ErrNoRows {
			return nil, fmt.Errorf("failed to validate player team status: %w", err)
		}
	}
	if hasTeam {
		return nil, ErrPlayerHasTeam
	}

	updateTeamQuery := `UPDATE teams SET current_member = current_member + 1 WHERE team_id = $1`
	_, err = tx.Exec(updateTeamQuery, teamID)
	if err != nil {
		return nil, fmt.Errorf("failed to update team count: %w", err)
	}

	upsertPlayerQuery := `
		INSERT INTO players (user_id, team_id, has_team, is_solo_player)
		VALUES ($1, $2, true, false)
		ON CONFLICT (user_id) DO UPDATE
		SET team_id = EXCLUDED.team_id,
		    has_team = EXCLUDED.has_team,
		    is_solo_player = EXCLUDED.is_solo_player`

	_, err = tx.Exec(upsertPlayerQuery, playerUserID, teamID)
	if err != nil {
		return nil, fmt.Errorf("failed to update player record: %w", err)
	}

	team.CurrentMember++

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit join transaction: %w", err)
	}

	return &team, nil
}

func (r *TeamRepository) GetAllTeams() ([]models.Team, error) {
	query := `
		SELECT 
			team_id, team_name, team_skill_level, turf_name, 
			total_member, current_member, 
			captain_name, captain_contact, captain_email, looking_positions, created_at
		FROM teams
		ORDER BY team_id DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query teams: %w", err)
	}
	defer rows.Close()

	var teams = []models.Team{}
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
			&t.CaptainEmail,
			&t.LookingPositions,
			&t.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan team: %w", err)
		}
		teams = append(teams, t)
	}

	return teams, nil
}

func (r *TeamRepository) CleanupExpiredTeams(days int) (int, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return 0, fmt.Errorf("failed to begin cleanup transaction: %w", err)
	}
	defer tx.Rollback()

	// 1. Reset players whose teams are older than 'days'
	resetPlayersQuery := `
		UPDATE players 
		SET team_id = NULL, has_team = false 
		WHERE team_id IN (
			SELECT team_id FROM teams 
			WHERE created_at < NOW() - ($1 || ' days')::interval
		)`

	_, err = tx.Exec(resetPlayersQuery, days)
	if err != nil {
		return 0, fmt.Errorf("failed to reset players: %w", err)
	}

	// 2. Delete the expired teams
	// Use RETURNING to count how many were deleted
	deleteTeamsQuery := `
		DELETE FROM teams 
		WHERE created_at < NOW() - ($1 || ' days')::interval`

	result, err := tx.Exec(deleteTeamsQuery, days)
	if err != nil {
		return 0, fmt.Errorf("failed to delete expired teams: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit cleanup: %w", err)
	}

	return int(rowsAffected), nil
}

func (r *TeamRepository) DeleteTeam(teamID int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin delete transaction: %w", err)
	}
	defer tx.Rollback()

	// 1. Reset players assigned to this team
	resetPlayersQuery := `
		UPDATE players 
		SET team_id = NULL, has_team = false 
		WHERE team_id = $1`

	_, err = tx.Exec(resetPlayersQuery, teamID)
	if err != nil {
		return fmt.Errorf("failed to reset players during team deletion: %w", err)
	}

	// 2. Delete the team
	deleteTeamQuery := `DELETE FROM teams WHERE team_id = $1`
	_, err = tx.Exec(deleteTeamQuery, teamID)
	if err != nil {
		return fmt.Errorf("failed to delete team: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit team deletion: %w", err)
	}

	return nil
}
