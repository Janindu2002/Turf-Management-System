package routes

import (
	"turf-reservation-backend/internal/config"
	"turf-reservation-backend/internal/handlers"
	"turf-reservation-backend/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures all application routes
func SetupRouter(authHandler *handlers.AuthHandler, availabilityHandler *handlers.AvailabilityHandler, bookingHandler *handlers.BookingHandler, eventHandler *handlers.EventHandler, playerHandler *handlers.PlayerHandler, teamHandler *handlers.TeamHandler, cfg *config.Config) *gin.Engine {
	// Set Gin mode based on environment
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		// In development, we can still use ReleaseMode if we want minimal logs,
		// but let's stick to the user's request for "minimal" output regardless.
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger()) // Restore logging for visibility
	router.Use(gin.Recovery())

	// Disable trusted proxies warning
	router.SetTrustedProxies(nil)

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{cfg.AllowedOrigin, "http://127.0.0.1:5173"},
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
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
		}

		// Protected authentication routes
		authProtected := api.Group("/auth")
		authProtected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			authProtected.POST("/logout", authHandler.Logout)
			authProtected.GET("/me", authHandler.Me)
		}

		// Protected routes - All authenticated users
		common := api.Group("")
		common.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// Booking routes
			common.POST("/bookings", bookingHandler.CreateBooking)
			common.GET("/bookings/my", bookingHandler.GetMyBookings)
			common.PUT("/bookings/:id/reschedule", bookingHandler.RescheduleBooking)
			common.POST("/bookings/:id/cancel", bookingHandler.CancelBooking)
			common.DELETE("/bookings/:id", bookingHandler.RemoveCancelledBooking)

			// Event routes
			common.POST("/events/host", eventHandler.HostEvent)
			common.GET("/events/my", eventHandler.GetMyEvents)
			common.DELETE("/events/:id", eventHandler.DeleteEvent)

			// Player routes
			common.GET("/players/me", playerHandler.GetMyProfile)
			common.PUT("/players/profile", playerHandler.UpdateProfile)
			common.PUT("/players/availability", playerHandler.ToggleAvailability)

			// Team routes
			common.GET("/teams", teamHandler.GetTeams)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		admin.Use(middleware.RequireAdmin())
		{
			// Booking Management
			admin.GET("/bookings/pending", bookingHandler.GetPendingBookings)
			admin.POST("/bookings/:id/approve", bookingHandler.ApproveBooking)
			admin.POST("/bookings/:id/reject", bookingHandler.RejectBooking)
			// Event Management
			admin.GET("/events/pending", eventHandler.GetPendingEvents)
			admin.GET("/events", eventHandler.GetAllEvents)
			admin.POST("/events/:id/approve", eventHandler.ApproveEvent)
			admin.POST("/events/:id/reject", eventHandler.RejectEvent)

			// Slot Management
			admin.POST("/slots/block", availabilityHandler.BlockSlots)
			admin.POST("/slots/:id/unblock", availabilityHandler.UnblockSlot)

			// Player Management (Comprehensive)
			admin.GET("/players", playerHandler.GetAllPlayers)
			admin.DELETE("/players/:id", playerHandler.DeletePlayer)

			// Solo Players Management
			admin.GET("/players/solo", playerHandler.GetAdminSoloPlayers)

			// Team Management
			adminTeams := admin.Group("/teams")
			adminTeams.GET("", teamHandler.GetTeams)
			adminTeams.POST("", teamHandler.CreateTeam)
			adminTeams.DELETE("/:id", teamHandler.DeleteTeam)
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
