package services

import (
	"fmt"
	"net/smtp"
	"turf-reservation-backend/internal/config"
)

type EmailService struct {
	config *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{config: cfg}
}

// SendResetOTP sends a password reset OTP to the user
func (s *EmailService) SendResetOTP(to, name, otp string) error {
	fromHeader := fmt.Sprintf("From: %s\n", s.config.SMTPFrom)
	subject := "Subject: Password Reset OTP\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body := fmt.Sprintf(`
		<html>
		<body style="font-family: sans-serif; color: #374151;">
			<div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
				<h2 style="color: #10b981;">Password Reset</h2>
				<p>Hi %s,</p>
				<p>You requested a password reset for your Turf Reservation account.</p>
				<p>Your 6-digit verification code is:</p>
				<div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
					<span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #065f46;">%s</span>
				</div>
				<p style="font-size: 14px; color: #6b7280;">This code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
				<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="font-size: 14px; color: #9ca3af;">Thanks,<br>Turf Reservation Team</p>
			</div>
		</body>
		</html>
	`, name, otp)

	msg := []byte(fromHeader + subject + mime + body)
	addr := fmt.Sprintf("%s:%s", s.config.SMTPHost, s.config.SMTPPort)
	auth := smtp.PlainAuth("", s.config.SMTPUser, s.config.SMTPPass, s.config.SMTPHost)

	err := smtp.SendMail(addr, auth, s.config.SMTPFrom, []string{to}, msg)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// SendVerificationOTP sends a registration verification OTP to the user
func (s *EmailService) SendVerificationOTP(to, otp string) error {
	fromHeader := fmt.Sprintf("From: %s\n", s.config.SMTPFrom)
	subject := "Subject: Registration Verification OTP\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body := fmt.Sprintf(`
		<html>
		<body style="font-family: sans-serif; color: #374151;">
			<div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
				<h2 style="color: #10b981;">Email Verification</h2>
				<p>Thank you for choosing Turf Reservation!</p>
				<p>To complete your registration, please use the following 6-digit verification code:</p>
				<div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
					<span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #065f46;">%s</span>
				</div>
				<p style="font-size: 14px; color: #6b7280;">This code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
				<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="font-size: 14px; color: #9ca3af;">Thanks,<br>Turf Reservation Team</p>
			</div>
		</body>
		</html>
	`, otp)

	msg := []byte(fromHeader + subject + mime + body)
	addr := fmt.Sprintf("%s:%s", s.config.SMTPHost, s.config.SMTPPort)
	auth := smtp.PlainAuth("", s.config.SMTPUser, s.config.SMTPPass, s.config.SMTPHost)

	err := smtp.SendMail(addr, auth, s.config.SMTPFrom, []string{to}, msg)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}
