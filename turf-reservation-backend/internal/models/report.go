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
