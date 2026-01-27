package main

import (
	"log"

	"turf-reservation-backend/internal/config"
	"turf-reservation-backend/internal/database"
	"turf-reservation-backend/internal/handlers"
	"turf-reservation-backend/internal/repositories"
	"turf-reservation-backend/internal/routes"
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
	logRepo := repositories.NewSecurityLogRepository(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, logRepo, cfg)

	// Setup routes
	router := routes.SetupRouter(authHandler, cfg)

	// Start server
	serverAddr := ":" + cfg.ServerPort
	log.Printf("🚀 Server: http://localhost%s\n", serverAddr)

	if err := router.Run(serverAddr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
