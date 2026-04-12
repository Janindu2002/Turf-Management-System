package services

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"time"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
)

type ReportService struct {
	reportRepo *repositories.ReportRepository
}

func NewReportService(reportRepo *repositories.ReportRepository) *ReportService {
	return &ReportService{reportRepo: reportRepo}
}

// GenerateCSVReport generates a CSV report for the given period
func (s *ReportService) GenerateCSVReport(adminID int, period string) ([]byte, string, error) {
	var startDate, endDate time.Time
	endDate = time.Now()

	switch period {
	case "weekly":
		startDate = endDate.AddDate(0, 0, -7)
	case "monthly":
		startDate = endDate.AddDate(0, -1, 0)
	case "annual":
		startDate = endDate.AddDate(-1, 0, 0)
	default:
		return nil, "", fmt.Errorf("invalid report period: %s", period)
	}

	// 1. Get Details from Repo
	details, err := s.reportRepo.GetBookingDetails(startDate, endDate)
	if err != nil {
		return nil, "", err
	}

	// 2. Format as CSV
	buf := new(bytes.Buffer)
	writer := csv.NewWriter(buf)

	// Write Header
	header := []string{"Booking ID", "Date", "Player", "Turf", "Status", "Price (LKR)", "Payment"}
	if err := writer.Write(header); err != nil {
		return nil, "", err
	}

	// Write Rows
	for _, d := range details {
		row := []string{
			fmt.Sprintf("%d", d.BookingID),
			d.BookingDate.Format("2006-01-02"),
			d.PlayerName,
			d.TurfName,
			d.Status,
			fmt.Sprintf("%.2f", d.TotalPrice),
			d.PaymentStatus,
		}
		if err := writer.Write(row); err != nil {
			return nil, "", err
		}
	}
	writer.Flush()

	// 3. Log the report in DB
	report := &models.Report{
		AdminID:    &adminID,
		ReportType: period,
		Date:       endDate,
	}
	err = s.reportRepo.Create(report)
	if err != nil {
		return nil, "", fmt.Errorf("failed to log report: %w", err)
	}

	fileName := fmt.Sprintf("turf_report_%s_%s.csv", period, endDate.Format("20060102"))
	return buf.Bytes(), fileName, nil
}

// GetDashboardStats retrieves high-level metrics for the analytics dashboard
func (s *ReportService) GetDashboardStats() (*models.ReportStats, error) {
	// For dashboard, we show last 30 days stats by default
	endDate := time.Now()
	startDate := endDate.AddDate(0, -1, 0)
	return s.reportRepo.GetBookingStats(startDate, endDate)
}
