package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole creates middleware that checks if user has one of the allowed roles
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user role from context (set by AuthMiddleware)
		userRole, exists := GetUserRole(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Authentication required",
			})
			c.Abort()
			return
		}

		// Check if user's role is in the allowed roles list
		allowed := false
		for _, role := range allowedRoles {
			if userRole == role {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":   "Insufficient permissions",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAdmin is a convenience middleware for admin-only routes
func RequireAdmin() gin.HandlerFunc {
	return RequireRole("admin")
}

// RequireCoach is a convenience middleware for coach routes
func RequireCoach() gin.HandlerFunc {
	return RequireRole("coach", "admin") // Admin can also access coach routes
}

// RequirePlayer is a convenience middleware for player routes
func RequirePlayer() gin.HandlerFunc {
	return RequireRole("player", "coach", "admin") // All authenticated users
}
