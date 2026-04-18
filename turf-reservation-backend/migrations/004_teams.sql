-- Reconstruct teams table
CREATE TABLE IF NOT EXISTS teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) UNIQUE NOT NULL,
    team_skill_level VARCHAR(50),
    turf_name VARCHAR(255),
    total_member INT NOT NULL,
    current_member INT DEFAULT 0,
    captain_name VARCHAR(255),
    captain_contact VARCHAR(255),
    captain_email VARCHAR(255) DEFAULT '',
    looking_positions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
