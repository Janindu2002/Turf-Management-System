package handlers

import (
	"log"
	"net/http"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type PlayerHandler struct {
	playerService *services.PlayerService
}

func NewPlayerHandler(playerService *services.PlayerService) *PlayerHandler {
	return &PlayerHandler{playerService: playerService}
}

func (h *PlayerHandler) GetMyProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	profile, err := h.playerService.GetPlayerProfile(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

func (h *PlayerHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var profile models.PlayerProfile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := h.playerService.UpdatePlayerProfile(userID.(int), &profile); err != nil {
		log.Printf("ERROR: UpdatePlayerProfile failed for user %v: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
	})
}

func (h *PlayerHandler) GetAdminSoloPlayers(c *gin.Context) {
	players, err := h.playerService.GetSoloPlayers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    players,
	})
}

func (h *PlayerHandler) ToggleAvailability(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		IsAvailable bool `json:"is_available"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := h.playerService.ToggleAvailability(userID.(int), req.IsAvailable); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	message := "Marked as unavailable"
	if req.IsAvailable {
		message = "Marked as available"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
	})
}
