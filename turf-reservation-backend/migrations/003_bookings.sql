-- Reconstruct bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    time_slot_id INT NOT NULL,
    coach_id INT REFERENCES users(user_id),
    event_id INT,
    status VARCHAR(50) DEFAULT 'pending',
    coach_approval_status VARCHAR(20) DEFAULT 'none',
    admin_approval_status VARCHAR(20) DEFAULT 'pending',
    total_price DECIMAL(10, 2),
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
