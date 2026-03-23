package services

import (
	"fmt"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

type PlayerService struct {
	playerRepo *repositories.PlayerRepository
	userRepo   *repositories.UserRepository
}

func NewPlayerService(playerRepo *repositories.PlayerRepository, userRepo *repositories.UserRepository) *PlayerService {
	return &PlayerService{
		playerRepo: playerRepo,
		userRepo:   userRepo,
	}
}

func (s *PlayerService) GetPlayerProfile(userID int) (*models.PlayerProfile, error) {
	user, err := s.userRepo.GetUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	player, err := s.playerRepo.GetPlayerByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get player: %w", err)
	}

	profile := &models.PlayerProfile{
		UserID: user.UserID,
		Name:   user.Name,
		Email:  user.Email,
		Phone:  user.Phone,
	}

	if player != nil {
		profile.TeamID = player.TeamID
		profile.SkillLevel = player.SkillLevel
		profile.Position = player.Position
		profile.AvailableDays = player.AvailableDays
		profile.Description = player.Description
		profile.IsSoloPlayer = player.IsSoloPlayer
		profile.IsAvailable = player.IsAvailable
		profile.HasTeam = player.HasTeam
	}

	return profile, nil
}

func (s *PlayerService) UpdatePlayerProfile(userID int, profile *models.PlayerProfile) error {
	// Update user details if needed (optional based on requirements, but useful)
	user, err := s.userRepo.GetUserByID(userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	user.Name = profile.Name
	user.Phone = profile.Phone
	if err := s.userRepo.UpdateUser(user); err != nil {
		return fmt.Errorf("failed to update user details: %w", err)
	}

	// Upsert player details
	player := &models.Player{
		UserID:        userID,
		TeamID:        profile.TeamID,
		SkillLevel:    profile.SkillLevel,
		Position:      profile.Position,
		AvailableDays: profile.AvailableDays,
		Description:   profile.Description,
		IsSoloPlayer:  profile.IsSoloPlayer,
		IsAvailable:   profile.IsAvailable,
		HasTeam:       profile.HasTeam,
	}

	return s.playerRepo.UpsertPlayer(player)
}

func (s *PlayerService) GetSoloPlayers() ([]models.PlayerProfile, error) {
	return s.playerRepo.GetSoloPlayers()
}

func (s *PlayerService) ToggleAvailability(userID int, isAvailable bool) error {
	return s.playerRepo.UpdateAvailability(userID, isAvailable)
}
