package main

import (
	"log"

	"turf-reservation-backend/internal/config"
	"turf-reservation-backend/internal/database"
	"turf-reservation-backend/internal/handlers"
	"turf-reservation-backend/internal/repositories"
	"turf-reservation-backend/internal/routes"
	"turf-reservation-backend/internal/services"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database connection
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	resetRepo := repositories.NewPasswordResetRepository(db)
	logRepo := repositories.NewSecurityLogRepository(db)
	timeSlotRepo := repositories.NewTimeSlotRepository(db)
	bookingRepo := repositories.NewBookingRepository(db)
	eventRepo := repositories.NewEventRepository(db)
	playerRepo := repositories.NewPlayerRepository(db)
	teamRepo := repositories.NewTeamRepository(db)
	coachRepo := repositories.NewCoachRepository(db)
	reportRepo := repositories.NewReportRepository(db)
	verificationRepo := repositories.NewEmailVerificationRepository(db)

	// Initialize services
	emailService := services.NewEmailService(cfg)
	bookingService := services.NewBookingService(bookingRepo, timeSlotRepo)
	eventService := services.NewEventService(eventRepo, timeSlotRepo)
	playerService := services.NewPlayerService(playerRepo, userRepo)
	teamService := services.NewTeamService(teamRepo)
	reportService := services.NewReportService(reportRepo)

	// Ensure timeslots exist for the next 7 days
	if err := timeSlotRepo.EnsureSlotsExist(); err != nil {
		log.Printf("Warning: Failed to ensure timeslots exist: %v", err)
	}

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, playerRepo, coachRepo, resetRepo, logRepo, emailService, verificationRepo, cfg)
	availabilityHandler := handlers.NewAvailabilityHandler(timeSlotRepo)
	bookingHandler := handlers.NewBookingHandler(bookingService)
	eventHandler := handlers.NewEventHandler(eventService)
	playerHandler := handlers.NewPlayerHandler(playerService)
	teamHandler := handlers.NewTeamHandler(teamService)
	coachHandler := handlers.NewCoachHandler(coachRepo, userRepo)
	reportHandler := handlers.NewReportHandler(reportService)

	// Start background workers
	teamService.StartCleanupWorker()

	// Setup routes
	router := routes.SetupRouter(authHandler, availabilityHandler, bookingHandler, eventHandler, playerHandler, teamHandler, coachHandler, reportHandler, cfg)

	// Start server
	serverAddr := ":" + cfg.ServerPort
	log.Printf("🚀 Server: http://localhost%s\n", serverAddr)

	if err := router.Run(serverAddr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
