package handlers

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"turf-reservation-backend/internal/config"
	"turf-reservation-backend/internal/middleware"
	"turf-reservation-backend/internal/models"
	"turf-reservation-backend/internal/repositories"
	"turf-reservation-backend/internal/services"
	"turf-reservation-backend/internal/utils"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo     *repositories.UserRepository
	playerRepo   *repositories.PlayerRepository
	coachRepo    *repositories.CoachRepository
	resetRepo    *repositories.PasswordResetRepository
	logRepo      *repositories.SecurityLogRepository
	emailService *services.EmailService
	config       *config.Config
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(userRepo *repositories.UserRepository, playerRepo *repositories.PlayerRepository, coachRepo *repositories.CoachRepository, resetRepo *repositories.PasswordResetRepository, logRepo *repositories.SecurityLogRepository, emailService *services.EmailService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		userRepo:     userRepo,
		playerRepo:   playerRepo,
		coachRepo:    coachRepo,
		resetRepo:    resetRepo,
		logRepo:      logRepo,
		emailService: emailService,
		config:       cfg,
	}
}

// RegisterRequest represents registration request body
type RegisterRequest struct {
	Name     string `form:"name" json:"name" binding:"required"`
	Email    string `form:"email" json:"email" binding:"required,email"`
	Phone    string `form:"phone" json:"phone"`
	Password string `form:"password" json:"password" binding:"required"`
	Role     string `form:"role" json:"role" binding:"required,oneof=player coach"`
	HasTeam  *bool  `form:"has_team" json:"has_team"`
}

// LoginRequest represents login request body
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	// Parse multipart form first (32MB max) so both form fields and files are accessible
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		// Fallback: try parsing as regular form (for application/x-www-form-urlencoded or JSON)
		if parseErr := c.Request.ParseForm(); parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Invalid request format",
			})
			return
		}
	}

	// Extract fields manually from form
	name := strings.TrimSpace(c.Request.FormValue("name"))
	email := strings.ToLower(strings.TrimSpace(c.Request.FormValue("email")))
	phone := strings.TrimSpace(c.Request.FormValue("phone"))
	password := c.Request.FormValue("password")
	role := strings.TrimSpace(c.Request.FormValue("role"))

	// Validate required fields
	if name == "" || email == "" || password == "" || role == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Name, email, password, and role are required",
		})
		return
	}
	if role != "player" && role != "coach" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Role must be 'player' or 'coach'",
		})
		return
	}

	// For coaches: validate certificate is present BEFORE creating any user record
	var certFile multipart.File
	var certHeader *multipart.FileHeader
	if role == "coach" {
		var err error
		certFile, certHeader, err = c.Request.FormFile("certificate")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Coaching certificate is required",
			})
			return
		}
		defer certFile.Close()
	}


	// Validate password complexity
	if err := h.validatePassword(password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}
	// Validate phone number (exactly 10 digits)
	if phone != "" {
		if err := h.validatePhone(phone); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			return
		}
	}

	// Check if email already exists
	exists, err := h.userRepo.EmailExists(email)
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
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to process registration",
		})
		return
	}

	// Create user
	user := &models.User{
		Name:     name,
		Email:    email,
		Phone:    phone,
		Password: hashedPassword,
		Role:     role,
	}

	if err := h.userRepo.CreateUser(user); err != nil {
		h.recordLog(c, nil, "registration", "failure", "Failed to create user: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create user",
		})
		return
	}

	// Create role-specific record
	switch role {
	case "player":
		hasTeamStr := c.Request.FormValue("has_team")
		hasTeam := hasTeamStr == "true"
		player := &models.Player{
			UserID:  user.UserID,
			HasTeam: hasTeam,
		}
		if err := h.playerRepo.UpsertPlayer(player); err != nil {
			// We log the error but don't fail the registration as the user is already created
			h.recordLog(c, &user.UserID, "registration_player", "failure", "Failed to create player record: "+err.Error())
		}

	case "coach":
		// certFile and certHeader were already validated and fetched above
		_ = certFile // already closed via defer

		// Resolve absolute path for uploads dir
		xwd, _ := os.Getwd()
		uploadsDir := filepath.Join(xwd, "uploads", "certificates")
		if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to prepare upload directory",
			})
			return
		}

		// Save the file using absolute path
		filename := fmt.Sprintf("%d_%s_%s", user.UserID, time.Now().Format("20060102150405"), certHeader.Filename)
		absPath := filepath.Join(uploadsDir, filename)
		certificatePath := filepath.Join("uploads", "certificates", filename)
		if err := c.SaveUploadedFile(certHeader, absPath); err != nil {
			h.recordLog(c, &user.UserID, "registration_coach_file", "failure", "Failed to save certificate: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to process registration documents",
			})
			return
		}

		coach := &models.Coach{
			UserID:      user.UserID,
			Certificate: certificatePath,
		}
		if err := h.coachRepo.UpsertCoach(coach); err != nil {
			h.recordLog(c, &user.UserID, "registration_coach", "failure", "Failed to create coach record: "+err.Error())
		}
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

// ForgotPassword handles the request to send a password reset link
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid email address"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	user, err := h.userRepo.GetUserByEmail(email)
	if err != nil {
		// We return success even if user not found to prevent email enumeration
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "If your email is registered, you will receive a reset link shortly.",
		})
		return
	}

	// Generate 6-digit OTP
	otp := fmt.Sprintf("%06d", uuid.New().ID()%1000000)
	expiry := time.Now().Add(15 * time.Minute) // OTPs usually have shorter expiry

	// Save token in DB
	err = h.resetRepo.CreateToken(user.UserID, otp, expiry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to generate OTP"})
		return
	}

	// Send email with OTP
	err = h.emailService.SendResetOTP(user.Email, user.Name, otp)
	if err != nil {
		h.recordLog(c, &user.UserID, "forgot_password", "failure", "Failed to send reset email: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to send reset OTP"})
		return
	}

	h.recordLog(c, &user.UserID, "forgot_password", "success", "Reset OTP sent")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "If your email is registered, you will receive a reset link shortly.",
	})
}

// ResetPassword handles the password update using a reset token
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		OTP      string `json:"otp" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	user, err := h.userRepo.GetUserByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "User not found"})
		return
	}

	// Verify token (OTP)
	resetToken, err := h.resetRepo.GetByToken(req.OTP)
	if err != nil || resetToken.UserID != user.UserID {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid or expired OTP"})
		return
	}

	// Check expiry
	if time.Now().After(resetToken.ExpiresAt) {
		_ = h.resetRepo.DeleteToken(req.OTP)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "OTP has expired"})
		return
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		h.recordLog(c, &resetToken.UserID, "password_reset", "failure", "Failed to hash new password: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to process request"})
		return
	}

	// Update password
	err = h.userRepo.UpdatePassword(resetToken.UserID, hashedPassword)
	if err != nil {
		h.recordLog(c, &resetToken.UserID, "password_reset", "failure", "Failed to update user password in DB: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update password"})
		return
	}

	// Delete token
	_ = h.resetRepo.DeleteToken(req.OTP)

	h.recordLog(c, &resetToken.UserID, "password_reset", "success", "Password updated successfully via reset link")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password updated successfully. You can now login with your new password.",
	})
}
