CREATE TABLE IF NOT EXISTS events (
    event_id            SERIAL PRIMARY KEY,
    user_id             INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_name          VARCHAR(255) NOT NULL,
    event_type          VARCHAR(100) NOT NULL DEFAULT 'Friendly Match',
    start_date          DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_date            DATE NOT NULL,
    expected_participants INT,
    description         TEXT,
    requirements        TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
