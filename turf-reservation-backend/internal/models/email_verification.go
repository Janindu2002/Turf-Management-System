package models

import "time"

// EmailVerification represents an email verification record in the database
type EmailVerification struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	OTP       string    `json:"otp"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}
