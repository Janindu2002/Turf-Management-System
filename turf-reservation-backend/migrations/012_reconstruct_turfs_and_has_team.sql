-- Add has_team to players, create turfs table and link to time_slots

ALTER TABLE players ADD COLUMN IF NOT EXISTS has_team BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS turfs (
    turf_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    price_per_hour DECIMAL(10, 2) DEFAULT 12500
);

-- Ensure default turf exists
INSERT INTO turfs (turf_id, name, location) VALUES (1, 'Astro Turf Main', 'Colombo, Sri Lanka') ON CONFLICT (turf_id) DO NOTHING;

-- Add turf_id to time_slots if missing
ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS turf_id INT REFERENCES turfs(turf_id) DEFAULT 1;
