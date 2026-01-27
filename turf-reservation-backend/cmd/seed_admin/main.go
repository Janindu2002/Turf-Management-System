package main

import (
	"log"

	"golang.org/x/crypto/bcrypt"

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

	// Admin details
	name := "P.Vishwanathan"
	email := "admin@turf.com"
	password := "Admin@123"
	role := "admin"
	phone := "0714166382"

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		log.Fatal("Password hashing failed:", err)
	}

	// SQL (NOW MATCHES TABLE CONSTRAINTS)
	query := `
	INSERT INTO users (name, email, phone, password, role)
	VALUES ($1, $2, $3, $4, $5)
	ON CONFLICT (email) DO 
		UPDATE SET phone = EXCLUDED.phone, name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role;
	`

	// Exec (PARAM COUNT MATCHES PLACEHOLDERS)
	_, err = db.Exec(query, name, email, phone, string(hashedPassword), role)
	if err != nil {
		log.Fatal("Failed to seed admin:", err)
	}

	log.Println("✅ Admin user seeded successfully")
}
