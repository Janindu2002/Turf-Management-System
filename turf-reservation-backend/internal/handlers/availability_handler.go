package handlers

import (
	"fmt"
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

// BlockSlots handles batch blocking of slots by an admin
func (h *AvailabilityHandler) BlockSlots(c *gin.Context) {
	var req struct {
		IDs    []int  `json:"ids" binding:"required"`
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request payload. 'ids' and 'reason' are required.",
		})
		return
	}

	if err := h.timeSlotRepo.BlockMultipleSlots(req.IDs, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to block slots",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Slots blocked successfully",
	})
}

// UnblockSlot handles unblocking of a single slot by an admin
func (h *AvailabilityHandler) UnblockSlot(c *gin.Context) {
	idStr := c.Param("id")
	var id int
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid slot ID",
		})
		return
	}

	if err := h.timeSlotRepo.UnblockSlot(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to unblock slot",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Slot unblocked successfully",
	})
}
