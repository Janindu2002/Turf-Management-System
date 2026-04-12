package models

import "time"

// Report represents a report in the system
type Report struct {
	ReportID      int       `json:"report_id"`
	AdminID       *int      `json:"admin_id,omitempty"`
	ReportType    string    `json:"report_type"`
	GeneratedDate time.Time `json:"generated_date"`
	Date          time.Time `json:"date"`
}

// ReportStats represents aggregated statistics for a report
type ReportStats struct {
	TotalBookings     int     `json:"total_bookings"`
	ConfirmedBookings int     `json:"confirmed_bookings"`
	CancelledBookings int     `json:"cancelled_bookings"`
	PendingBookings   int     `json:"pending_bookings"`
	TotalRevenue      float64 `json:"total_revenue"`
}

// ReportDetail represents detailed booking record for CSV export
type ReportDetail struct {
	BookingID     int       `json:"booking_id"`
	BookingDate   time.Time `json:"booking_date"`
	PlayerName    string    `json:"player_name"`
	TurfName      string    `json:"turf_name"`
	Status        string    `json:"status"`
	TotalPrice    float64   `json:"total_price"`
	PaymentStatus string    `json:"payment_status"`
}
