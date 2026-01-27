package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"turf-reservation-backend/internal/config"
	"turf-reservation-backend/internal/middleware"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
	"turf-reservation-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo *repositories.UserRepository
	logRepo  *repositories.SecurityLogRepository
	config   *config.Config
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(userRepo *repositories.UserRepository, logRepo *repositories.SecurityLogRepository, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		userRepo: userRepo,
		logRepo:  logRepo,
		config:   cfg,
	}
}

// RegisterRequest represents registration request body
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=player coach"`
}

// LoginRequest represents login request body
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	// Normalize email
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Validate password complexity
	if err := h.validatePassword(req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}
	// Validate phone number (exactly 10 digits)
	if req.Phone != "" {
		if err := h.validatePhone(req.Phone); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			return
		}
	}

	// Check if email already exists
	exists, err := h.userRepo.EmailExists(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to check email availability",
		})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"error":   "Email already registered",
		})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to process registration",
		})
		return
	}

	// Create user
	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Phone:    req.Phone,
		Password: hashedPassword,
		Role:     req.Role,
	}

	if err := h.userRepo.CreateUser(user); err != nil {
		h.recordLog(c, nil, "registration", "failure", "Failed to create user: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create user",
		})
		return
	}

	h.recordLog(c, &user.UserID, "registration", "success", "User registered successfully")

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data": gin.H{
			"user": user.ToResponse(),
		},
		"message": "Registration successful",
	})
}

// recordLog is a helper to record security logs
func (h *AuthHandler) recordLog(c *gin.Context, userID *int, eventType, status, details string) {
	log := &models.SecurityLog{
		UserID:    userID,
		EventType: eventType,
		IPAddress: c.ClientIP(),
		UserAgent: c.Request.UserAgent(),
		Status:    status,
		Details:   details,
	}
	_ = h.logRepo.Create(log) // We ignore errors for logging to not block the main request
}

// validatePassword checks if password meets complexity requirements
func (h *AuthHandler) validatePassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}

	// Check for uppercase letter
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	if !hasUpper {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}

	// Check for digit
	hasDigit := regexp.MustCompile(`[0-9]`).MatchString(password)
	if !hasDigit {
		return fmt.Errorf("password must contain at least one number")
	}

	// Check for special character
	hasSpecial := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`).MatchString(password)
	if !hasSpecial {
		return fmt.Errorf("password must contain at least one special character")
	}

	return nil
}

// validatePhone checks if phone number is exactly 10 digits
func (h *AuthHandler) validatePhone(phone string) error {
	// Remove any common formatting characters if they might be present
	phone = strings.ReplaceAll(phone, " ", "")
	phone = strings.ReplaceAll(phone, "-", "")

	// Check if all characters are digits
	isNumeric := regexp.MustCompile(`^[0-9]+$`).MatchString(phone)
	if !isNumeric {
		return fmt.Errorf("phone number must contain only digits")
	}

	// Check length
	if len(phone) != 10 {
		return fmt.Errorf("phone number must be exactly 10 digits")
	}

	return nil
}

// Login handles user authentication
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	// Normalize email
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Get user by email
	user, err := h.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		if err == repositories.ErrUserNotFound {
			h.recordLog(c, nil, "login", "failure", "Unknown email: "+req.Email)
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Invalid email or password",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to process login",
		})
		return
	}

	// Verify password
	if err := utils.CheckPassword(user.Password, req.Password); err != nil {
		h.recordLog(c, &user.UserID, "login", "failure", "Incorrect password")
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Invalid email or password",
		})
		return
	}

	h.recordLog(c, &user.UserID, "login", "success", "User logged in successfully")

	// Generate JWT token
	token, err := utils.GenerateToken(
		user.UserID,
		user.Email,
		user.Role,
		h.config.JWTSecret,
		h.config.JWTExpiryHours,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to generate token",
		})
		return
	}

	// Set HTTP-only cookie (XSS protection)
	c.SetCookie(
		"token",                      // name
		token,                        // value
		h.config.JWTExpiryHours*3600, // maxAge in seconds
		"/",                          // path
		"",                           // domain (empty = current domain)
		false,                        // secure (set to true in production with HTTPS)
		true,                         // httpOnly (prevents JavaScript access)
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token": token,
			"user":  user.ToResponse(),
		},
		"message": "Login successful",
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// Clear the authentication cookie
	c.SetCookie(
		"token", // name
		"",      // value (empty)
		-1,      // maxAge (negative = delete)
		"/",     // path
		"",      // domain
		false,   // secure
		true,    // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logout successful",
	})
}

// Me returns current user information
func (h *AuthHandler) Me(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Authentication required",
		})
		return
	}

	// Fetch user from database
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		if err == repositories.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch user information",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user": user.ToResponse(),
		},
	})
}
