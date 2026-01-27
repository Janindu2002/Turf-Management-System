CREATE TABLE IF NOT EXISTS time_slots (
    time_slot_id SERIAL PRIMARY KEY,
    turf_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    UNIQUE(turf_id, date, start_time)
);