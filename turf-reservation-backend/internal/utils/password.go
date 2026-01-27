package utils

import (
	"golang.org/x/crypto/bcrypt"
)

const (
	// Cost factor for bcrypt hashing
	// Higher cost = more secure but slower
	// 12 is a good balance between security and performance
	bcryptCost = 12
)

// HashPassword hashes a plain text password using bcrypt
// Returns the hashed password or an error
func HashPassword(password string) (string, error) {
	// Generate hash with automatic salt
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// CheckPassword compares a hashed password with a plain text password
// Returns nil if passwords match, error otherwise
func CheckPassword(hashedPassword, password string) error {
	// CompareHashAndPassword uses constant-time comparison
	// to prevent timing attacks
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
