package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Database Configuration
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// Server Configuration
	ServerPort string

	// JWT Configuration
	JWTSecret      string
	JWTExpiryHours int

	// CORS Configuration
	AllowedOrigin string

	// Application Environment
	AppEnv string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	// Load .env file if it exists (development mode)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Parse JWT expiry hours (default to 24)
	jwtExpiry, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	if err != nil {
		log.Println("Invalid JWT_EXPIRY_HOURS, using default 24")
		jwtExpiry = 24
	}

	return &Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "turf_db"),
		DBSSLMode:      getEnv("DB_SSLMODE", "disable"),
		ServerPort:     getEnv("PORT", "8080"),
		JWTSecret:      getEnv("JWT_SECRET", "change-this-secret-key-in-production"),
		JWTExpiryHours: jwtExpiry,
		AllowedOrigin:  getEnv("ALLOWED_ORIGIN", "http://localhost:5173"),
		AppEnv:         getEnv("APP_ENV", "production"),
	}
}

// getEnv retrieves environment variable or returns default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
