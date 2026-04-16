package repositories

import (
	"database/sql"
	"fmt"
	"turf-reservation-backend/internal/models"
)

type PlayerRepository struct {
	db *sql.DB
}

func NewPlayerRepository(db *sql.DB) *PlayerRepository {
	return &PlayerRepository{db: db}
}

func (r *PlayerRepository) GetPlayerByUserID(userID int) (*models.Player, error) {
	query := `
		SELECT user_id, team_id, skill_level, position, COALESCE(available_days, ''), COALESCE(description, ''), is_solo_player, is_available, has_team, updated_at
		FROM players
		WHERE user_id = $1
	`
	player := &models.Player{}
	err := r.db.QueryRow(query, userID).Scan(
		&player.UserID,
		&player.TeamID,
		&player.SkillLevel,
		&player.Position,
		&player.AvailableDays,
		&player.Description,
		&player.IsSoloPlayer,
		&player.IsAvailable,
		&player.HasTeam,
		&player.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil // Return nil if not found, not an error for upsert flow
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get player by user ID: %w", err)
	}
	return player, nil
}

func (r *PlayerRepository) UpsertPlayer(player *models.Player) error {
	query := `
		INSERT INTO players (user_id, team_id, skill_level, position, available_days, description, is_solo_player, is_available, has_team)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (user_id) DO UPDATE
		SET team_id = EXCLUDED.team_id,
		    skill_level = EXCLUDED.skill_level,
		    position = EXCLUDED.position,
		    available_days = EXCLUDED.available_days,
		    description = EXCLUDED.description,
		    is_solo_player = EXCLUDED.is_solo_player,
		    is_available = EXCLUDED.is_available,
		    has_team = EXCLUDED.has_team
	`
	_, err := r.db.Exec(
		query,
		player.UserID,
		player.TeamID,
		player.SkillLevel,
		player.Position,
		player.AvailableDays,
		player.Description,
		player.IsSoloPlayer,
		player.IsAvailable,
		player.HasTeam,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert player: %w", err)
	}
	return nil
}

func (r *PlayerRepository) GetSoloPlayers() ([]models.PlayerProfile, error) {
	query := `
		SELECT u.user_id, u.name, u.email, COALESCE(u.phone, ''), 
		       p.team_id, p.skill_level, p.position, COALESCE(p.available_days, ''), COALESCE(p.description, ''), p.is_solo_player, p.is_available, p.has_team
		FROM users u
		JOIN players p ON u.user_id = p.user_id
		WHERE p.is_solo_player = true AND p.is_available = true AND p.has_team = false
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get solo players: %w", err)
	}
	defer rows.Close()

	var players = []models.PlayerProfile{}
	for rows.Next() {
		var p models.PlayerProfile
		err := rows.Scan(
			&p.UserID, &p.Name, &p.Email, &p.Phone,
			&p.TeamID, &p.SkillLevel, &p.Position, &p.AvailableDays, &p.Description, &p.IsSoloPlayer, &p.IsAvailable, &p.HasTeam,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan solo player: %w", err)
		}
		players = append(players, p)
	}
	return players, nil
}

func (r *PlayerRepository) UpdateAvailability(userID int, isAvailable bool) error {
	query := `
		INSERT INTO players (user_id, is_available)
		VALUES ($1, $2)
		ON CONFLICT (user_id) DO UPDATE
		SET is_available = EXCLUDED.is_available
	`
	_, err := r.db.Exec(query, userID, isAvailable)
	if err != nil {
		return fmt.Errorf("failed to update player availability: %w", err)
	}
	return nil
}

func (r *PlayerRepository) GetAllPlayers() ([]models.PlayerProfile, error) {
	query := `
		SELECT u.user_id, u.name, u.email, COALESCE(u.phone, ''), 
		       p.team_id, COALESCE(p.skill_level, ''), COALESCE(p.position, ''), COALESCE(p.available_days, ''), COALESCE(p.description, ''), 
		       COALESCE(p.is_solo_player, false), COALESCE(p.is_available, false), COALESCE(p.has_team, false),
		       COALESCE((SELECT TO_CHAR(MAX(created_at), 'YYYY-MM-DD HH:MI AM') 
		        FROM security_logs 
		        WHERE user_id = u.user_id AND event_type = 'login' AND status = 'success'), 'Never') as last_login
		FROM users u
		LEFT JOIN players p ON u.user_id = p.user_id
		WHERE u.role = 'player'
		ORDER BY u.name ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all players: %w", err)
	}
	defer rows.Close()

	var players = []models.PlayerProfile{}
	for rows.Next() {
		var p models.PlayerProfile
		err := rows.Scan(
			&p.UserID, &p.Name, &p.Email, &p.Phone,
			&p.TeamID, &p.SkillLevel, &p.Position, &p.AvailableDays, &p.Description, 
			&p.IsSoloPlayer, &p.IsAvailable, &p.HasTeam, &p.LastLogin,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan player profile: %w", err)
		}
		players = append(players, p)
	}
	return players, nil
}

