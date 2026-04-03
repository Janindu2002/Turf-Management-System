package services

import (
	"log"
	"time"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

type TeamService struct {
	teamRepo *repositories.TeamRepository
}

func NewTeamService(teamRepo *repositories.TeamRepository) *TeamService {
	return &TeamService{teamRepo: teamRepo}
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
