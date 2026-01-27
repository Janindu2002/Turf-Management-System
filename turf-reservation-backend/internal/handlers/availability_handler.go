package handlers

import (
	"net/http"
	"turf-reservation-backend/internal/repositories"

	"github.com/gin-gonic/gin"
)

type AvailabilityHandler struct {
	timeSlotRepo *repositories.TimeSlotRepository
}

// NewAvailabilityHandler creates a new availability handler
func NewAvailabilityHandler(timeSlotRepo *repositories.TimeSlotRepository) *AvailabilityHandler {
	return &AvailabilityHandler{
		timeSlotRepo: timeSlotRepo,
	}
}

// GetAvailability returns available time slots for a given date
func (h *AvailabilityHandler) GetAvailability(c *gin.Context) {
	date := c.Query("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Date parameter is required",
		})
		return
	}

	slots, err := h.timeSlotRepo.GetByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch availability",
		})
		return
	}

	// Convert models to response format
	response := make([]interface{}, len(slots))
	for i, slot := range slots {
		response[i] = slot.ToResponse()
	}

	c.JSON(http.StatusOK, response)
}
