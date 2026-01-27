package models

import "time"

// User represents a user in the system
type User struct {
	UserID   int       `json:"user_id"`
	Name     string    `json:"name"`
	Email    string    `json:"email"`
	Phone    string    `json:"phone,omitempty"`
	Password string    `json:"-"` // Never include password in JSON responses
	Role     string    `json:"role"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

// UserResponse represents a user response without sensitive data
type UserResponse struct {
	UserID int    `json:"user_id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Phone  string `json:"phone,omitempty"`
	Role   string `json:"role"`
}

// ToResponse converts User to UserResponse (without password)
func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		UserID: u.UserID,
		Name:   u.Name,
		Email:  u.Email,
		Phone:  u.Phone,
		Role:   u.Role,
	}
}
