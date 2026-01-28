package database

import (
	"database/sql"
	"fmt"
	"log"

	"turf-reservation-backend/internal/config"

	_ "github.com/lib/pq"
)

// InitDB initializes and returns a database connection
func InitDB(cfg *config.Config) (*sql.DB, error) {
	// Build connection string
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBName,
		cfg.DBSSLMode,
	)

	// Open database connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)   // Maximum number of open connections
	db.SetMaxIdleConns(5)    // Maximum number of idle connections
	db.SetConnMaxLifetime(0) // No limit on connection lifetime

	log.Println("✓ Database connection established")
	return db, nil
}
