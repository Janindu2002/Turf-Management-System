package handlers

import (
	"net/http"
	"strconv"
	"turf-reservation-backend/internal/middleware"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type BookingHandler struct {
	bookingService *services.BookingService
}

// NewBookingHandler creates a new booking handler
func NewBookingHandler(bookingService *services.BookingService) *BookingHandler {
	return &BookingHandler{bookingService: bookingService}
}

// CreateBookingRequest represents the request body for making a reservation
type CreateBookingRequest struct {
	TimeSlotID *int    `json:"time_slot_id" binding:"required"`
	CoachID    *int    `json:"coach_id"`
	EventID    *int    `json:"event_id"`
	TotalPrice float64 `json:"total_price" binding:"required"`
}

// CreateBooking handles POST /api/bookings
func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Get user ID from middleware
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	booking := &models.Booking{
		UserID:     &userID,
		TimeSlotID: req.TimeSlotID,
		CoachID:    req.CoachID,
		EventID:    req.EventID,
		TotalPrice: req.TotalPrice,
	}

	err := h.bookingService.MakeReservation(booking)
	if err != nil {
		if err == services.ErrSlotNotAvailable {
			c.JSON(http.StatusConflict, gin.H{"error": "Timeslot is already booked"})
			return
		}
		// Log the actual error for debugging
		println("MakeReservation error:", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	c.JSON(http.StatusCreated, booking)
}

// RescheduleRequest represents the request body for rescheduling
type RescheduleRequest struct {
	NewTimeSlotID int      `json:"new_time_slot_id" binding:"required"`
	CoachID       *int     `json:"coach_id"`
	TotalPrice    *float64 `json:"total_price"`
}

// RescheduleBooking handles PUT /api/bookings/:id/reschedule
func (h *BookingHandler) RescheduleBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var req RescheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Get user ID from context
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err = h.bookingService.RescheduleBooking(id, req.NewTimeSlotID, userID, req.CoachID, req.TotalPrice)
	if err != nil {
		if err == services.ErrBookingNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
			return
		}
		if err == services.ErrSlotNotAvailable {
			c.JSON(http.StatusConflict, gin.H{"error": "New timeslot is already booked"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking rescheduled successfully"})
}


// CancelBooking handles POST /api/bookings/:id/cancel
func (h *BookingHandler) CancelBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Get user ID from context
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err = h.bookingService.CancelBooking(id, userID)
	if err != nil {
		println("CancelBooking error for ID", id, "User", userID, ":", err.Error())
		if err == services.ErrBookingNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking cancelled successfully"})
}

// GetBooking handles GET /api/bookings/:id
func (h *BookingHandler) GetBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	booking, err := h.bookingService.GetBooking(id, userID)
	if err != nil {
		if err == services.ErrBookingNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, booking)
}

// GetMyBookings handles GET /api/bookings/my
func (h *BookingHandler) GetMyBookings(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	bookings, err := h.bookingService.GetUserBookings(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

// GetPendingBookings handles GET /api/admin/bookings/pending
func (h *BookingHandler) GetPendingBookings(c *gin.Context) {
	bookings, err := h.bookingService.GetAllPendingBookings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending bookings"})
		return
	}
	c.JSON(http.StatusOK, bookings)
}

// GetAllBookings handles GET /api/admin/bookings
func (h *BookingHandler) GetAllBookings(c *gin.Context) {
	bookings, err := h.bookingService.GetAllBookings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch all bookings"})
		return
	}
	c.JSON(http.StatusOK, bookings)
}


// ApproveBooking handles POST /api/admin/bookings/:id/approve
func (h *BookingHandler) ApproveBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	err = h.bookingService.ApproveBooking(id)
	if err != nil {
		if err == services.ErrBookingNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve booking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking approved successfully"})
}

// RejectBooking handles POST /api/admin/bookings/:id/reject
func (h *BookingHandler) RejectBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	err = h.bookingService.RejectBooking(id)
	if err != nil {
		println("RejectBooking error for ID", id, ":", err.Error())
		if err == services.ErrBookingNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject booking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking rejected successfully"})
}

// RemoveCancelledBooking handles DELETE /api/bookings/:id — only removes cancelled bookings
func (h *BookingHandler) RemoveCancelledBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err = h.bookingService.RemoveCancelledBooking(id, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking removed successfully"})
}

// GetCoachRequests handles GET /api/coach/bookings
func (h *BookingHandler) GetCoachRequests(c *gin.Context) {
	coachID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	bookings, err := h.bookingService.GetCoachBookings(coachID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch coach bookings"})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

// CoachApproveBooking handles POST /api/coach/bookings/:id/approve
func (h *BookingHandler) CoachApproveBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	coachID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err = h.bookingService.CoachApproveBooking(id, coachID)
	if err != nil {
		if err == services.ErrBookingNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking approved by coach"})
}

// CoachRejectBooking handles POST /api/coach/bookings/:id/reject
func (h *BookingHandler) CoachRejectBooking(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	coachID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err = h.bookingService.CoachRejectBooking(id, coachID)
	if err != nil {
		if err == services.ErrBookingNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking rejected by coach"})
}
