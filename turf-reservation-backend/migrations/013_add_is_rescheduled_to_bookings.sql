-- Add is_rescheduled column to bookings table
ALTER TABLE bookings ADD COLUMN is_rescheduled BOOLEAN DEFAULT FALSE;
