package services

import (
	"errors"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

var ErrEventNotFound = errors.New("event not found")

type EventService struct {
	eventRepo *repositories.EventRepository
}

func NewEventService(eventRepo *repositories.EventRepository) *EventService {
	return &EventService{eventRepo: eventRepo}
}

// HostEvent creates a new event request with pending status
func (s *EventService) HostEvent(event *models.Event) error {
	event.Status = "pending"
	return s.eventRepo.Create(event)
}

// GetAllPendingEvents returns all pending event requests in FIFO order
func (s *EventService) GetAllPendingEvents() ([]*models.Event, error) {
	return s.eventRepo.ListAllPending()
}

// ApproveEvent marks an event as approved
func (s *EventService) ApproveEvent(eventID int) error {
	return s.eventRepo.UpdateStatus(eventID, "approved")
}

// RejectEvent marks an event as rejected
func (s *EventService) RejectEvent(eventID int) error {
	return s.eventRepo.UpdateStatus(eventID, "rejected")
}

// GetMyEvents returns all events hosted by a specific user
func (s *EventService) GetMyEvents(userID int) ([]*models.Event, error) {
	return s.eventRepo.ListByUserID(userID)
}
