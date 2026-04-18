package main

import (
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"turf-reservation-backend/internal/config"
	"turf-reservation-backend/internal/database"
)

func main() {
	// Load config
	cfg := config.LoadConfig()

	// Init DB
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatal("DB init failed:", err)
	}
	defer db.Close()

	log.Println("✓ Database connection established")

	// Create schema_migrations table if not exists
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		)
	`)
	if err != nil {
		log.Fatal("Failed to create schema_migrations table:", err)
	}

	// Read migrations directory
	files, err := os.ReadDir("migrations")
	if err != nil {
		log.Fatal("Failed to read migrations directory:", err)
	}

	var migrationFiles []string
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".sql") {
			migrationFiles = append(migrationFiles, f.Name())
		}
	}
	sort.Strings(migrationFiles)

	for _, filename := range migrationFiles {
		// Check if migration already applied
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", filename).Scan(&exists)
		if err != nil {
			log.Fatalf("Failed to check migration %s: %v", filename, err)
		}

		if exists {
			log.Printf("⏩ Migration %s already applied", filename)
			continue
		}

		log.Printf("🚀 Applying migration %s...", filename)
		content, err := os.ReadFile(filepath.Join("migrations", filename))
		if err != nil {
			log.Fatalf("Failed to read migration %s: %v", filename, err)
		}

		if len(content) == 0 {
			log.Printf("⚠️  Migration %s is empty, skipping", filename)
		} else {
			_, err = db.Exec(string(content))
			if err != nil {
				log.Fatalf("Failed to apply migration %s: %v", filename, err)
			}
		}

		// Mark as applied
		_, err = db.Exec("INSERT INTO schema_migrations (version) VALUES ($1)", filename)
		if err != nil {
			log.Fatalf("Failed to mark migration %s as applied: %v", filename, err)
		}
		log.Printf("✅ Migration %s applied successfully", filename)
	}

	log.Println("🎉 All migrations applied successfully!")
}
