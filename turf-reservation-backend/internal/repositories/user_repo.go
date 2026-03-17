package repositories

import (
	"database/sql"
	"errors"
	"fmt"

	"turf-reservation-backend/internal/models"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailAlreadyExists = errors.New("email already exists")
)

type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// CreateUser creates a new user in the database
func (r *UserRepository) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (name, email, phone, password, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING user_id
	`

	err := r.db.QueryRow(
		query,
		user.Name,
		user.Email,
		user.Phone,
		user.Password, // Already hashed by the service layer
		user.Role,
	).Scan(&user.UserID)

	if err != nil {
		// Check for unique constraint violation (duplicate email)
		if err.Error() == `pq: duplicate key value violates unique constraint "users_email_key"` {
			return ErrEmailAlreadyExists
		}
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// GetUserByEmail retrieves a user by email
func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	query := `
		SELECT user_id, name, email, COALESCE(phone, ''), password, role
		FROM users
		WHERE email = $1
	`

	user := &models.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.UserID,
		&user.Name,
		&user.Email,
		&user.Phone,
		&user.Password,
		&user.Role,
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (r *UserRepository) GetUserByID(userID int) (*models.User, error) {
	query := `
		SELECT user_id, name, email, COALESCE(phone, ''), role
		FROM users
		WHERE user_id = $1
	`

	user := &models.User{}
	err := r.db.QueryRow(query, userID).Scan(
		&user.UserID,
		&user.Name,
		&user.Email,
		&user.Phone,
		&user.Role,
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return user, nil
}

// UpdateUser updates user information
func (r *UserRepository) UpdateUser(user *models.User) error {
	query := `
		UPDATE users
		SET name = $1, email = $2, phone = $3
		WHERE user_id = $4
	`

	result, err := r.db.Exec(query, user.Name, user.Email, user.Phone, user.UserID)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return ErrUserNotFound
	}

	return nil
}

// EmailExists checks if an email already exists in the database
func (r *UserRepository) EmailExists(email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`

	var exists bool
	err := r.db.QueryRow(query, email).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check email existence: %w", err)
	}

	return exists, nil
}

// UpdatePassword updates a user's password
func (r *UserRepository) UpdatePassword(userID int, hashedPassword string) error {
	query := `UPDATE users SET password = $1 WHERE user_id = $2`

	result, err := r.db.Exec(query, hashedPassword, userID)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return ErrUserNotFound
	}

	return nil
}
