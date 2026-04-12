package handlers

import (
	"fmt"
	"net/http"
	"turf-reservation-backend/internal/middleware"
	"turf-reservation-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	reportService *services.ReportService
}

func NewReportHandler(reportService *services.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

// DownloadReport handles GET /api/admin/reports/download?type=weekly
func (h *ReportHandler) DownloadReport(c *gin.Context) {
	period := c.DefaultQuery("type", "weekly")
	
	// Get admin ID from middleware
	adminID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	csvData, fileName, err := h.reportService.GenerateCSVReport(adminID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to generate report: %v", err)})
		return
	}

	// Set headers for download
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Expires", "0")
	c.Header("Cache-Control", "must-revalidate")
	c.Header("Pragma", "public")

	c.Data(http.StatusOK, "text/csv", csvData)
}

// GetDashboardStats handles GET /api/admin/reports/stats
func (h *ReportHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.reportService.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dashboard stats"})
		return
	}
	c.JSON(http.StatusOK, stats)
}
