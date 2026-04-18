-- Migration: Add coach_approval_status and admin_approval_status to bookings table, and updated_at to coaches
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coach_approval_status VARCHAR(20) DEFAULT 'none';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_approval_status VARCHAR(20) DEFAULT 'pending';

-- Add updated_at to coaches table
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Update existing bookings: 
-- For ones with a coach, set coach_approval_status to 'pending' if it was previously undefined.
-- For now, we'll just set defaults.
UPDATE bookings SET coach_approval_status = 'pending' WHERE coach_id IS NOT NULL;
UPDATE bookings SET coach_approval_status = 'none' WHERE coach_id IS NULL;
UPDATE bookings SET admin_approval_status = 'approved' WHERE status = 'confirmed';
