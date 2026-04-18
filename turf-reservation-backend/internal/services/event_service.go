package services

import (
	"errors"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

var ErrEventNotFound = errors.New("event not found")

type EventService struct {
	eventRepo    *repositories.EventRepository
	timeslotRepo *repositories.TimeSlotRepository
}

func NewEventService(eventRepo *repositories.EventRepository, timeslotRepo *repositories.TimeSlotRepository) *EventService {
	return &EventService{
		eventRepo:    eventRepo,
		timeslotRepo: timeslotRepo,
	}
}

// HostEvent creates a new event request with pending status
func (s *EventService) HostEvent(event *models.Event) error {
	event.Status = "pending"
	err := s.eventRepo.Create(event)
	if err != nil {
		return err
	}

	// Immediately block slots for the pending event
	return s.timeslotRepo.BlockSlotsForEvent(event.StartDate, event.StartTime, event.EndDate, event.EndTime, event.EventName)
}

// GetAllPendingEvents returns all pending event requests in FIFO order
func (s *EventService) GetAllPendingEvents() ([]*models.Event, error) {
	return s.eventRepo.ListAllPending()
}

// GetAllEvents returns all events for admin overview
func (s *EventService) GetAllEvents() ([]*models.Event, error) {
	return s.eventRepo.ListAll()
}

// ApproveEvent marks an event as approved and blocks corresponding slots
func (s *EventService) ApproveEvent(eventID int) error {
	// 1. Get event details
	ev, err := s.eventRepo.GetByID(eventID)
	if err != nil {
		return err
	}
	if ev == nil {
		return ErrEventNotFound
	}

	// 2. Update status in db
	err = s.eventRepo.UpdateStatus(eventID, "approved")
	if err != nil {
		return err
	}

	// 3. Mark existing slots as 'booked'
	// We call a repository method or handle it here
	// The repo already has a query logic in EnsureSlotsExist, let's add a helper to update range
	return s.timeslotRepo.BlockSlotsForEvent(ev.StartDate, ev.StartTime, ev.EndDate, ev.EndTime, ev.EventName)
}

// RejectEvent marks an event as rejected
func (s *EventService) RejectEvent(eventID int) error {
	return s.eventRepo.UpdateStatus(eventID, "rejected")
}

// CancelEvent marks an event as cancelled and releases corresponding slots if it was approved
func (s *EventService) CancelEvent(eventID int) error {
	// 1. Get event details
	ev, err := s.eventRepo.GetByID(eventID)
	if err != nil {
		return err
	}
	if ev == nil {
		return ErrEventNotFound
	}

	previousStatus := ev.Status

	// 2. Update status in db
	err = s.eventRepo.UpdateStatus(eventID, "cancelled")
	if err != nil {
		return err
	}

	// 3. If it was approved, release the slots
	if previousStatus == "approved" {
		return s.timeslotRepo.ReleaseSlotsForEvent(ev.StartDate, ev.StartTime, ev.EndDate, ev.EndTime, ev.EventName)
	}

	return nil
}

// GetMyEvents returns all events hosted by a specific user
func (s *EventService) GetMyEvents(userID int) ([]*models.Event, error) {
	return s.eventRepo.ListByUserID(userID)
}

// DeleteEvent deletes a rejected event
func (s *EventService) DeleteEvent(eventID int, userID int) error {
	return s.eventRepo.DeleteRejected(eventID, userID)
}
