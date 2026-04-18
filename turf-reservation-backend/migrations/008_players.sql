-- Create players table
CREATE TABLE IF NOT EXISTS players (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    team_id INT,
    skill_level VARCHAR(50),
    position VARCHAR(50),
    available_days VARCHAR(100),
    description TEXT,
    is_solo_player BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_players_modtime ON players;
CREATE TRIGGER update_players_modtime
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_players_updated_at();
