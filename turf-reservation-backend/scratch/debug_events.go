package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "postgres://postgres:postgres@localhost:5432/turf_db?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	fmt.Println("--- All Events ---")
	rows, err := db.Query("SELECT event_id, event_name, start_date, start_time, end_date, end_time, status FROM events")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var name, sdate, stime, edate, etime, status string
		rows.Scan(&id, &name, &sdate, &stime, &edate, &etime, &status)
		fmt.Printf("EVENT ID: %d | Name: %s | Date: %s -> %s | Time: %s -> %s | Status: %s\n", id, name, sdate, edate, stime, etime, status)
	}

	fmt.Println("\n--- Slots for Any Future Date with an Event ---")
	// Let's find any slot that SHOULD be booked but isn't.
    // We check for slots where date matches an event date and the reason is empty.
	rows2, err := db.Query(`
        SELECT s.time_slot_id, s.date, s.start_time, s.status, s.blocked_reason, e.event_name, e.start_time, e.end_time
        FROM time_slots s
        JOIN events e ON s.date >= e.start_date AND s.date <= e.end_date
        WHERE e.status = 'approved'
        AND s.blocked_reason = ''
        LIMIT 20
    `)
	if err != nil {
		fmt.Printf("Check slots failed: %v\n", err)
	} else {
        defer rows2.Close()
        fmt.Println("Slots that might be missing blockage:")
        for rows2.Next() {
            var id int
            var date, start, status, reason, evName, evStart, evEnd string
            rows2.Scan(&id, &date, &start, &status, &reason, &evName, &evStart, &evEnd)
            fmt.Printf("Slot %d: Date %s | Start %s | Status %s | Event '%s' (%s - %s)\n", id, date, start, status, evName, evStart, evEnd)
        }
    }
}
