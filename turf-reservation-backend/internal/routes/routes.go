package routes

import (
	"turf-reservation-backend/internal/config"
	"turf-reservation-backend/internal/handlers"
	"turf-reservation-backend/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures all application routes
func SetupRouter(authHandler *handlers.AuthHandler, availabilityHandler *handlers.AvailabilityHandler, cfg *config.Config) *gin.Engine {
	if cfg.AppEnv != "development" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New() // Use gin.New() to remove default Logger and Recovery for even cleaner output
	router.Use(gin.Recovery())

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{cfg.AllowedOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // Required for cookies
	}
	router.Use(cors.New(corsConfig))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"message": "Turf Reservation API is running",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Public routes
		api.GET("/availability", availabilityHandler.GetAvailability)

		// Authentication routes (public)
		auth := api.Group("/auth")
		auth.Use(middleware.RateLimitMiddleware(5)) // Limit to 5 attempts per minute
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected authentication routes
		authProtected := api.Group("/auth")
		authProtected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			authProtected.POST("/logout", authHandler.Logout)
			authProtected.GET("/me", authHandler.Me)
		}

		// Protected routes - All authenticated users
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// Placeholder for future authenticated routes
			// Example: protected.GET("/bookings/my", bookingHandler.GetMyBookings)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		admin.Use(middleware.RequireAdmin())
		{
			// Placeholder for admin routes
			// Example: admin.GET("/stats", adminHandler.GetStats)
		}

		// Coach routes
		coach := api.Group("/coach")
		coach.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		coach.Use(middleware.RequireCoach())
		{
			// Placeholder for coach routes
			// Example: coach.POST("/teams", teamHandler.CreateTeam)
		}
	}

	return router
}
