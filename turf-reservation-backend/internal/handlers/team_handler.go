package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"turf-reservation-backend/internal/middleware"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
	"turf-reservation-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type TeamHandler struct {
	teamService *services.TeamService
}

func NewTeamHandler(teamService *services.TeamService) *TeamHandler {
	return &TeamHandler{teamService: teamService}
}

func (h *TeamHandler) CreateTeam(c *gin.Context) {
	var team models.Team
	if err := c.ShouldBindJSON(&team); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := h.teamService.CreateTeam(&team); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    team,
		"message": "Team created successfully",
	})
}

func (h *TeamHandler) JoinTeam(c *gin.Context) {
	idParam := c.Param("id")
	teamID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	err = h.teamService.JoinTeam(teamID, userID)
	if err != nil {
		if errors.Is(err, repositories.ErrTeamFull) || errors.Is(err, repositories.ErrPlayerHasTeam) || errors.Is(err, repositories.ErrTeamNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "You have joined the team!",
	})
}

func (h *TeamHandler) GetTeams(c *gin.Context) {
	teams, err := h.teamService.GetAllTeams()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    teams,
	})
}

func (h *TeamHandler) DeleteTeam(c *gin.Context) {
	idParam := c.Param("id")
	teamID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	err = h.teamService.DeleteTeam(teamID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team deleted successfully"})
}
