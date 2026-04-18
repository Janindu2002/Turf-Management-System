-- Reconstruct users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'player',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
