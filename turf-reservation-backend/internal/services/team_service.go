package services

import (
	"fmt"
	"log"
	"time"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

type TeamService struct {
	teamRepo     *repositories.TeamRepository
	emailService *EmailService
	userRepo     *repositories.UserRepository
}

func NewTeamService(teamRepo *repositories.TeamRepository, emailService *EmailService, userRepo *repositories.UserRepository) *TeamService {
	return &TeamService{teamRepo: teamRepo, emailService: emailService, userRepo: userRepo}
}

func (s *TeamService) CreateTeam(team *models.Team) error {
	return s.teamRepo.CreateTeam(team)
}

func (s *TeamService) GetAllTeams() ([]models.Team, error) {
	return s.teamRepo.GetAllTeams()
}

func (s *TeamService) DeleteTeam(teamID int) error {
	return s.teamRepo.DeleteTeam(teamID)
}

func (s *TeamService) JoinTeam(teamID, playerUserID int) error {
	team, err := s.teamRepo.JoinTeam(teamID, playerUserID)
	if err != nil {
		return err
	}

	player, err := s.userRepo.GetUserByID(playerUserID)
	if err != nil {
		return fmt.Errorf("failed to load player details: %w", err)
	}

	go func() {
		if err := s.emailService.SendTeamJoinNotification(
			player.Email,
			player.Name,
			player.Phone,
			team.CaptainName,
			team.CaptainContact,
			team.CaptainEmail,
			team.TeamName,
		); err != nil {
			log.Printf("[TeamService] failed to send join notification: %v", err)
		}
	}()

	return nil
}

func (s *TeamService) StartCleanupWorker() {
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		// Run immediately on start
		s.performCleanup()

		for range ticker.C {
			s.performCleanup()
		}
	}()
}

func (s *TeamService) performCleanup() {
	count, err := s.teamRepo.CleanupExpiredTeams(7)
	if err != nil {
		log.Printf("[CleanupWorker] Error during team cleanup: %v", err)
		return
	}
	if count > 0 {
		log.Printf("[CleanupWorker] Successfully cleaned up %d expired teams", count)
	}
}
