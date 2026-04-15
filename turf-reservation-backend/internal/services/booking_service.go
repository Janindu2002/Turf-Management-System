package services

import (
	"errors"
	"fmt"
	"log"
	"time"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

var (
	ErrSlotNotAvailable = errors.New("timeslot is not available")
	ErrBookingNotFound  = errors.New("booking not found")
)

type BookingService struct {
	bookingRepo         *repositories.BookingRepository
	timeslotRepo        *repositories.TimeSlotRepository
	notificationService *NotificationService
}

// NewBookingService creates a new booking service
func NewBookingService(bookingRepo *repositories.BookingRepository, timeslotRepo *repositories.TimeSlotRepository, notificationService *NotificationService) *BookingService {
	return &BookingService{
		bookingRepo:         bookingRepo,
		timeslotRepo:        timeslotRepo,
		notificationService: notificationService,
	}
}

// MakeReservation creates a new booking and updates timeslot status
func (s *BookingService) MakeReservation(booking *models.Booking) error {
	// Check if timeslot is available
	slot, err := s.timeslotRepo.GetByID(*booking.TimeSlotID)
	if err != nil {
		return fmt.Errorf("failed to check timeslot: %w", err)
	}
	if slot == nil {
		return errors.New("timeslot not found")
	}
	if slot.Status != "available" {
		return ErrSlotNotAvailable
	}

	// Rule 1: 24-Hour Lead Time
	if time.Until(slot.StartTime) < 24*time.Hour {
		return errors.New("reservations must be made at least 24 hours in advance")
	}

	// Rule 2: 7-Day Booking Window
	y, m, d := time.Now().Date()
	todayStart := time.Date(y, m, d, 0, 0, 0, 0, time.Now().Location())
	maxWindow := todayStart.AddDate(0, 0, 8) // Start of 8th day from today
	if !slot.StartTime.Before(maxWindow) {
		return errors.New("reservations can only be made for the upcoming 7 days")
	}

	// Set initial approval statuses
	if booking.CoachID != nil {
		booking.CoachApprovalStatus = "pending"
	} else {
		booking.CoachApprovalStatus = "none"
	}
	booking.AdminApprovalStatus = "pending"
	booking.Status = "pending"

	if booking.PaymentStatus == "" {
		booking.PaymentStatus = "pending"
	}

	// Create booking
	err = s.bookingRepo.Create(booking)
	if err != nil {
		return err
	}

	// Update timeslot status
	err = s.timeslotRepo.UpdateStatus(*booking.TimeSlotID, "booked")
	if err != nil {
		return fmt.Errorf("failed to update timeslot status: %w", err)
	}

	// Notify user
	enriched, _ := s.bookingRepo.GetByID(booking.BookingID)
	if enriched != nil {
		s.notificationService.NotifyBookingChange(enriched, "Created")
	}

	return nil
}

// RescheduleBooking moves a booking to a new timeslot and resets status to pending
func (s *BookingService) RescheduleBooking(bookingID int, newTimeSlotID int, userID int, coachID *int, totalPrice *float64) error {
	// Get existing booking
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	// Verify ownership
	if *booking.UserID != userID {
		log.Printf("RescheduleBooking: unauthorized attempt by user %d to reschedule booking %d owned by %d", userID, bookingID, *booking.UserID)
		return errors.New("unauthorized: you can only reschedule your own bookings")
	}

	// Check if new timeslot is available
	newSlot, err := s.timeslotRepo.GetByID(newTimeSlotID)
	if err != nil {
		return err
	}
	if newSlot == nil {
		return errors.New("new timeslot not found")
	}
	// Ensure the slot is available, or it's the player's own current slot
	if newSlot.Status != "available" && newTimeSlotID != *booking.TimeSlotID {
		return ErrSlotNotAvailable
	}

	// Rule 1: 24-Hour Lead Time
	if time.Until(newSlot.StartTime) < 24*time.Hour {
		return errors.New("rescheduling requires at least 24 hours advance notice from the new start time")
	}

	// Rule 2: 7-Day Booking Window
	y, m, d := time.Now().Date()
	todayStart := time.Date(y, m, d, 0, 0, 0, 0, time.Now().Location())
	maxWindow := todayStart.AddDate(0, 0, 8)
	if !newSlot.StartTime.Before(maxWindow) {
		return errors.New("rescheduling can only be done within the upcoming 7 days")
	}

	oldTimeSlotID := *booking.TimeSlotID

	// Update timeslot status for the old one
	err = s.timeslotRepo.UpdateStatus(oldTimeSlotID, "available")
	if err != nil {
		return err
	}

	// Update booking with new timeslot and reset status to pending
	*booking.TimeSlotID = newTimeSlotID
	booking.Status = "pending"

	// Apply new coach and price from request
	booking.CoachID = coachID
	if totalPrice != nil {
		booking.TotalPrice = *totalPrice
	}

	// Reset approval statuses as it's essentially a new request for a new timeslot
	booking.AdminApprovalStatus = "pending"
	if booking.CoachID != nil {
		booking.CoachApprovalStatus = "pending"
	} else {
		booking.CoachApprovalStatus = "none"
	}

	err = s.bookingRepo.Update(booking)
	if err != nil {
		// Rollback old timeslot status if update fails
		s.timeslotRepo.UpdateStatus(oldTimeSlotID, "booked")
		return err
	}

	// Update timeslot status for the new one
	err = s.timeslotRepo.UpdateStatus(newTimeSlotID, "booked")
	if err != nil {
		return err
	}

	// Notify user
	enriched, _ := s.bookingRepo.GetByID(booking.BookingID)
	if enriched != nil {
		s.notificationService.NotifyBookingChange(enriched, "Updated")
	}

	return nil
}

// CancelBooking cancels a booking and frees the timeslot, verifying ownership
func (s *BookingService) CancelBooking(bookingID int, userID int) error {
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		log.Printf("CancelBooking: failed to get booking %d: %v", bookingID, err)
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	// Verify ownership
	if *booking.UserID != userID {
		log.Printf("CancelBooking: unauthorized attempt by user %d to cancel booking %d owned by %d", userID, bookingID, *booking.UserID)
		return errors.New("unauthorized: you can only cancel your own bookings")
	}

	// Update booking status
	booking.Status = "cancelled"
	err = s.bookingRepo.Update(booking)
	if err != nil {
		log.Printf("CancelBooking: failed to update booking status for %d: %v", bookingID, err)
		return err
	}

	// Free the timeslot
	err = s.timeslotRepo.UpdateStatus(*booking.TimeSlotID, "available")
	if err != nil {
		log.Printf("CancelBooking: failed to free timeslot %d for booking %d: %v", *booking.TimeSlotID, bookingID, err)
		return err
	}

	// Notify user
	s.notificationService.NotifyBookingChange(booking, "Cancelled")

	return nil
}

// GetUserBookings retrieves all bookings for a user
func (s *BookingService) GetUserBookings(userID int) ([]*models.Booking, error) {
	return s.bookingRepo.ListByUser(userID)
}

// GetAllPendingBookings retrieves all pending bookings (FIFO)
func (s *BookingService) GetAllPendingBookings() ([]*models.Booking, error) {
	return s.bookingRepo.ListAllPending()
}

// ApproveBooking marks a booking as confirmed
func (s *BookingService) ApproveBooking(bookingID int) error {
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	booking.AdminApprovalStatus = "approved"

	// If no coach is required or coach has already approved, set status to confirmed
	isConfirmed := false
	if booking.CoachID == nil || booking.CoachApprovalStatus == "approved" {
		booking.Status = "confirmed"
		isConfirmed = true
	}

	err = s.bookingRepo.Update(booking)
	if err != nil {
		return err
	}

	// Notify user if confirmed
	if isConfirmed {
		s.notificationService.NotifyBookingChange(booking, "Confirmed")
	}

	return nil
}

// RejectBooking marks a booking as cancelled and frees the timeslot
func (s *BookingService) RejectBooking(bookingID int) error {
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		log.Printf("RejectBooking: failed to get booking %d: %v", bookingID, err)
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	booking.Status = "cancelled"
	err = s.bookingRepo.Update(booking)
	if err != nil {
		log.Printf("RejectBooking: failed to update booking status for %d: %v", bookingID, err)
		return err
	}

	// Free the timeslot
	err = s.timeslotRepo.UpdateStatus(*booking.TimeSlotID, "available")
	if err != nil {
		log.Printf("RejectBooking: failed to free timeslot %d for booking %d: %v", *booking.TimeSlotID, bookingID, err)
		return err
	}

	// Notify user
	s.notificationService.NotifyBookingChange(booking, "Cancelled")

	return nil
}

// RemoveCancelledBooking permanently deletes a cancelled booking for a user
func (s *BookingService) RemoveCancelledBooking(bookingID int, userID int) error {
	return s.bookingRepo.DeleteCancelled(bookingID, userID)
}

// CoachApproveBooking marks a booking as approved by the coach
func (s *BookingService) CoachApproveBooking(bookingID int, coachID int) error {
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	// Verify it's the right coach
	if booking.CoachID == nil || *booking.CoachID != coachID {
		return errors.New("unauthorized: you are not the assigned coach for this booking")
	}

	booking.CoachApprovalStatus = "approved"

	// If admin has already approved, set status to confirmed
	isConfirmed := false
	if booking.AdminApprovalStatus == "approved" {
		booking.Status = "confirmed"
		isConfirmed = true
	}

	err = s.bookingRepo.Update(booking)
	if err != nil {
		return err
	}

	// Notify user if confirmed
	if isConfirmed {
		s.notificationService.NotifyBookingChange(booking, "Confirmed")
	}

	return nil
}

// CoachRejectBooking marks a booking as rejected by the coach
func (s *BookingService) CoachRejectBooking(bookingID int, coachID int) error {
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	// Verify it's the right coach
	if booking.CoachID == nil || *booking.CoachID != coachID {
		return errors.New("unauthorized: you are not the assigned coach for this booking")
	}

	booking.CoachApprovalStatus = "rejected"
	booking.Status = "cancelled" // Rejecting by coach cancels the overall booking

	err = s.bookingRepo.Update(booking)
	if err != nil {
		return err
	}

	// Free the timeslot
	err = s.timeslotRepo.UpdateStatus(*booking.TimeSlotID, "available")
	if err != nil {
		return err
	}

	// Notify user
	s.notificationService.NotifyBookingChange(booking, "Cancelled")

	return nil
}

// GetBooking retrieves a single booking by ID and verifies ownership
func (s *BookingService) GetBooking(bookingID int, userID int) (*models.Booking, error) {
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, err
	}
	if booking == nil {
		return nil, ErrBookingNotFound
	}
	if *booking.UserID != userID {
		return nil, errors.New("unauthorized: you can only view your own bookings")
	}
	return booking, nil
}

// GetCoachBookings retrieves all bookings assigned to a coach
func (s *BookingService) GetCoachBookings(coachID int) ([]*models.Booking, error) {
	return s.bookingRepo.ListByCoach(coachID)
}

// GetAllBookings retrieves all bookings from the system (Admin only)
func (s *BookingService) GetAllBookings() ([]*models.Booking, error) {
	return s.bookingRepo.ListAll()
}

