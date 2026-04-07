package handlers

import (
	"net/http"
	"turf-reservation-backend/internal/repositories"

	"github.com/gin-gonic/gin"
)


type CoachHandler struct {
	coachRepo *repositories.CoachRepository
}

func NewCoachHandler(coachRepo *repositories.CoachRepository) *CoachHandler {
	return &CoachHandler{coachRepo: coachRepo}
}

// GetMyProfile returns the current coach's profile
func (h *CoachHandler) GetMyProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	coach, err := h.coachRepo.GetCoachByUserID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	if coach == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Coach profile not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    coach,
	})
}

// UpdateProfile updates the coach's availability settings
func (h *CoachHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	var req struct {
		Specialization string  `json:"specialization"`
		Availability   string  `json:"availability"`
		HourlyRate     float64 `json:"hourly_rate"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request body"})
		return
	}

	if err := h.coachRepo.UpdateCoachProfile(userID.(int), req.Specialization, req.Availability, req.HourlyRate); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
	})
}

// GetAllCoaches returns all coaches for players to browse
func (h *CoachHandler) GetAllCoaches(c *gin.Context) {
	coaches, err := h.coachRepo.GetAllCoaches()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	if coaches == nil {
		coaches = []repositories.CoachPublicProfile{}
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    coaches,
	})
}
