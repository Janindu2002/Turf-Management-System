package services

import (
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
