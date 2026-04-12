package repositories

import (
	"database/sql"
	"fmt"
	"time"
	"turf-reservation-backend/internal/models"
)

type ReportRepository struct {
	db *sql.DB
}

// NewReportRepository creates a new report repository
func NewReportRepository(db *sql.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

// Create inserts a new report record
func (r *ReportRepository) Create(report *models.Report) error {
	query := `
		INSERT INTO reports (admin_id, report_type, date)
		VALUES ($1, $2, $3)
		RETURNING report_id, generated_date
	`
	err := r.db.QueryRow(
		query,
		report.AdminID,
		report.ReportType,
		report.Date,
	).Scan(&report.ReportID, &report.GeneratedDate)

	if err != nil {
		return fmt.Errorf("failed to create report: %w", err)
	}
	return nil
}

// GetBookingStats aggregates stats for a date range
func (r *ReportRepository) GetBookingStats(startDate, endDate time.Time) (*models.ReportStats, error) {
	query := `
		SELECT 
			COUNT(*) as total_bookings,
			COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
			COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
			COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
			COALESCE(SUM(total_price) FILTER (WHERE status = 'confirmed'), 0) as total_revenue
		FROM bookings
		WHERE booking_date >= $1 AND booking_date <= $2
	`
	stats := &models.ReportStats{}
	err := r.db.QueryRow(query, startDate, endDate).Scan(
		&stats.TotalBookings,
		&stats.ConfirmedBookings,
		&stats.CancelledBookings,
		&stats.PendingBookings,
		&stats.TotalRevenue,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get booking stats: %w", err)
	}
	return stats, nil
}

// GetBookingDetails retrieves detailed records for a date range
func (r *ReportRepository) GetBookingDetails(startDate, endDate time.Time) ([]models.ReportDetail, error) {
	query := `
		SELECT 
			b.booking_id, b.booking_date, u.name as player_name, 
			t.name as turf_name, b.status, b.total_price, b.payment_status
		FROM bookings b
		JOIN users u ON b.user_id = u.user_id
		JOIN time_slots ts ON b.time_slot_id = ts.time_slot_id
		JOIN turfs t ON ts.turf_id = t.turf_id
		WHERE b.booking_date >= $1 AND b.booking_date <= $2
		ORDER BY b.booking_date DESC
	`
	rows, err := r.db.Query(query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get booking details: %w", err)
	}
	defer rows.Close()

	var details []models.ReportDetail
	for rows.Next() {
		var d models.ReportDetail
		err := rows.Scan(
			&d.BookingID,
			&d.BookingDate,
			&d.PlayerName,
			&d.TurfName,
			&d.Status,
			&d.TotalPrice,
			&d.PaymentStatus,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan report detail: %w", err)
		}
		details = append(details, d)
	}
	return details, nil
}
