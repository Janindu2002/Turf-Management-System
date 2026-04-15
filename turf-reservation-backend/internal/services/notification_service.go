package services

import (
	"fmt"
	"log"
	"strings"
	"time"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

type NotificationService struct {
	notificationRepo *repositories.NotificationRepository
	bookingRepo      *repositories.BookingRepository
	emailService     *EmailService
}

func NewNotificationService(notificationRepo *repositories.NotificationRepository, bookingRepo *repositories.BookingRepository, emailService *EmailService) *NotificationService {
	return &NotificationService{
		notificationRepo: notificationRepo,
		bookingRepo:      bookingRepo,
		emailService:     emailService,
	}
}

// NotifyBookingChange handles real-time notifications for booking events
func (s *NotificationService) NotifyBookingChange(booking *models.Booking, changeType string) {
	// 1. Prepare Message
	var statusMsg string
	details := s.formatBookingDetails(booking)

	switch changeType {
	case "Created":
		statusMsg = "Created"
	case "Updated":
		statusMsg = "Updated"
	case "Cancelled":
		statusMsg = "Cancelled"
	case "Confirmed":
		statusMsg = "Confirmed"
	default:
		statusMsg = changeType
	}

	// 2. Log to DB as 'pending'
	notification := &models.Notification{
		BookingID:  &booking.BookingID,
		UserID:     booking.UserID,
		Message:    fmt.Sprintf("Booking %s: %s", statusMsg, details),
		Date:       time.Now(),
		Type:       strings.ToLower(statusMsg),
		Status:     "pending",
		RetryCount: 0,
	}

	err := s.notificationRepo.Create(notification)
	if err != nil {
		log.Printf("[NotificationService] Failed to log notification: %v", err)
	}

	// 3. Send Email
	go func() {
		err := s.emailService.SendBookingStatusEmail(booking.PlayerEmail, booking.PlayerName, statusMsg, details)
		status := "sent"
		errorLog := ""
		if err != nil {
			log.Printf("[NotificationService] Failed to send email to %s: %v", booking.PlayerEmail, err)
			status = "failed"
			errorLog = err.Error()
		}

		// Update status in DB
		if notification.NotificationID != 0 {
			_ = s.notificationRepo.UpdateStatus(notification.NotificationID, status, errorLog)
		}
	}()
}

// StartReminderWorker begins the background process for 24-hour reminders
func (s *NotificationService) StartReminderWorker() {
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		log.Printf("[NotificationWorker] Started background reminder worker")
		s.checkAndSendReminders()

		for range ticker.C {
			s.checkAndSendReminders()
		}
	}()
}

func (s *NotificationService) checkAndSendReminders() {
	bookings, err := s.notificationRepo.GetUpcomingBookingsForReminder()
	if err != nil {
		log.Printf("[NotificationWorker] Error fetching upcoming bookings: %v", err)
		return
	}

	if len(bookings) == 0 {
		return
	}

	log.Printf("[NotificationWorker] Found %d bookings for reminder", len(bookings))

	for _, b := range bookings {
		details := s.formatBookingDetails(b)
		
		// Log to DB
		notification := &models.Notification{
			BookingID: &b.BookingID,
			UserID:    b.UserID,
			Message:   fmt.Sprintf("Booking Reminder: %s", details),
			Date:      time.Now(),
			Type:      "reminder",
			Status:    "pending",
		}

		_ = s.notificationRepo.Create(notification)

		// Send Email
		err := s.emailService.SendBookingReminderEmail(b.PlayerEmail, b.PlayerName, details)
		status := "sent"
		errLog := ""
		if err != nil {
			status = "failed"
			errLog = err.Error()
		}

		if notification.NotificationID != 0 {
			_ = s.notificationRepo.UpdateStatus(notification.NotificationID, status, errLog)
		}
	}
}

func (s *NotificationService) formatBookingDetails(b *models.Booking) string {
	return fmt.Sprintf("Turf: %s | Date: %s | Time: %s - %s", b.TurfName, b.SlotDate, b.StartTime, b.EndTime)
}
