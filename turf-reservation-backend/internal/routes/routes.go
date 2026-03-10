package routes

import (
	"turf-reservation-backend/internal/config"
	"turf-reservation-backend/internal/handlers"
	"turf-reservation-backend/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures all application routes
func SetupRouter(authHandler *handlers.AuthHandler, availabilityHandler *handlers.AvailabilityHandler, bookingHandler *handlers.BookingHandler, eventHandler *handlers.EventHandler, cfg *config.Config) *gin.Engine {
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
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// Booking routes
			protected.POST("/bookings", bookingHandler.CreateBooking)
			protected.GET("/bookings/my", bookingHandler.GetMyBookings)
			protected.PUT("/bookings/:id/reschedule", bookingHandler.RescheduleBooking)
			protected.POST("/bookings/:id/cancel", bookingHandler.CancelBooking)
			protected.DELETE("/bookings/:id", bookingHandler.RemoveCancelledBooking)
			// Event routes
			protected.POST("/events/host", eventHandler.HostEvent)
			protected.GET("/events/my", eventHandler.GetMyEvents)
			protected.DELETE("/events/:id", eventHandler.DeleteEvent)
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
