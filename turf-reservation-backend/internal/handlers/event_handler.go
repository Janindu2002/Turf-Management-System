package handlers

import (
	"net/http"
	"strconv"

	"turf-reservation-backend/internal/middleware"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type EventHandler struct {
	eventService *services.EventService
}

func NewEventHandler(eventService *services.EventService) *EventHandler {
	return &EventHandler{eventService: eventService}
}

// HostEvent handles POST /api/events/host
func (h *EventHandler) HostEvent(c *gin.Context) {
	type HostEventRequest struct {
		EventName            string `json:"eventName" binding:"required"`
		EventType            string `json:"eventType"`
		StartDate            string `json:"startDate" binding:"required"`
		StartTime            string `json:"startTime" binding:"required"`
		EndDate              string `json:"endDate" binding:"required"`
		EndTime              string `json:"endTime" binding:"required"`
		ExpectedParticipants *int   `json:"expectedParticipants,omitempty"`
		Description          string `json:"description"`
		Requirements         string `json:"requirements"`
	}

	var req HostEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	event := &models.Event{
		UserID:               &userID,
		EventName:            req.EventName,
		EventType:            req.EventType,
		StartDate:            req.StartDate,
		StartTime:            req.StartTime,
		EndDate:              req.EndDate,
		EndTime:              req.EndTime,
		ExpectedParticipants: req.ExpectedParticipants,
		Description:          req.Description,
		Requirements:         req.Requirements,
	}
	if event.EventType == "" {
		event.EventType = "Friendly Match"
	}

	if err := h.eventService.HostEvent(event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	c.JSON(http.StatusCreated, event)
}

// GetPendingEvents handles GET /api/admin/events/pending
func (h *EventHandler) GetPendingEvents(c *gin.Context) {
	events, err := h.eventService.GetAllPendingEvents()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending events"})
		return
	}
	c.JSON(http.StatusOK, events)
}

// GetAllEvents handles GET /api/admin/events (History)
func (h *EventHandler) GetAllEvents(c *gin.Context) {
	events, err := h.eventService.GetAllEvents()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event history"})
		return
	}
	c.JSON(http.StatusOK, events)
}

// ApproveEvent handles POST /api/admin/events/:id/approve
func (h *EventHandler) ApproveEvent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}
	if err := h.eventService.ApproveEvent(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve event"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Event approved successfully"})
}

// RejectEvent handles POST /api/admin/events/:id/reject
func (h *EventHandler) RejectEvent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}
	if err := h.eventService.RejectEvent(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject event"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Event rejected successfully"})
}

// CancelEvent handles POST /api/admin/events/:id/cancel
func (h *EventHandler) CancelEvent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}
	if err := h.eventService.CancelEvent(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel event"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Event cancelled successfully"})
}

// GetMyEvents handles GET /api/events/my
func (h *EventHandler) GetMyEvents(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	events, err := h.eventService.GetMyEvents(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch your events"})
		return
	}
	c.JSON(http.StatusOK, events)
}

// DeleteEvent handles DELETE /api/events/:id
func (h *EventHandler) DeleteEvent(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	if err := h.eventService.DeleteEvent(id, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event removed successfully"})
}
