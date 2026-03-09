package services

import (
	"errors"
	"fmt"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

var (
	ErrSlotNotAvailable = errors.New("timeslot is not available")
	ErrBookingNotFound  = errors.New("booking not found")
)

type BookingService struct {
	bookingRepo  *repositories.BookingRepository
	timeslotRepo *repositories.TimeSlotRepository
}

// NewBookingService creates a new booking service
func NewBookingService(bookingRepo *repositories.BookingRepository, timeslotRepo *repositories.TimeSlotRepository) *BookingService {
	return &BookingService{
		bookingRepo:  bookingRepo,
		timeslotRepo: timeslotRepo,
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

	// Set booking status
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

	return nil
}

// RescheduleBooking moves a booking to a new timeslot
func (s *BookingService) RescheduleBooking(bookingID int, newTimeSlotID int) error {
	// Get existing booking
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	// Check if new timeslot is available
	newSlot, err := s.timeslotRepo.GetByID(newTimeSlotID)
	if err != nil {
		return err
	}
	if newSlot == nil {
		return errors.New("new timeslot not found")
	}
	if newSlot.Status != "available" {
		return ErrSlotNotAvailable
	}

	oldTimeSlotID := *booking.TimeSlotID

	// Update timeslot status for the old one
	err = s.timeslotRepo.UpdateStatus(oldTimeSlotID, "available")
	if err != nil {
		return err
	}

	// Update booking with new timeslot
	*booking.TimeSlotID = newTimeSlotID
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

	return nil
}

// CancelBooking cancels a booking and frees the timeslot
func (s *BookingService) CancelBooking(bookingID int) error {
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	// Update booking status
	booking.Status = "cancelled"
	err = s.bookingRepo.Update(booking)
	if err != nil {
		return err
	}

	// Free the timeslot
	err = s.timeslotRepo.UpdateStatus(*booking.TimeSlotID, "available")
	if err != nil {
		return err
	}

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

	booking.Status = "confirmed"
	return s.bookingRepo.Update(booking)
}

// RejectBooking marks a booking as cancelled and frees the timeslot
func (s *BookingService) RejectBooking(bookingID int) error {
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return ErrBookingNotFound
	}

	booking.Status = "cancelled"
	err = s.bookingRepo.Update(booking)
	if err != nil {
		return err
	}

	// Free the timeslot
	return s.timeslotRepo.UpdateStatus(*booking.TimeSlotID, "available")
}

// RemoveCancelledBooking permanently deletes a cancelled booking for a user
func (s *BookingService) RemoveCancelledBooking(bookingID int, userID int) error {
	return s.bookingRepo.DeleteCancelled(bookingID, userID)
}
