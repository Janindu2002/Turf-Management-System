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

	fmt.Println("--- Syncing Pending Events to Schedule ---")
	rows, err := db.Query("SELECT event_name, TO_CHAR(start_date, 'YYYY-MM-DD'), TO_CHAR(start_time, 'HH24:MI'), TO_CHAR(end_date, 'YYYY-MM-DD'), TO_CHAR(end_time, 'HH24:MI') FROM events WHERE status = 'pending'")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var name, sdate, stime, edate, etime string
		rows.Scan(&name, &sdate, &stime, &edate, &etime)
		fmt.Printf("Syncing event: %s on %s\n", name, sdate)
		
		query := `
			UPDATE time_slots 
			SET status = 'booked', blocked_reason = $5
			WHERE date >= $1 AND date <= $2
			AND start_time::time >= $3 AND start_time::time < $4
		`
		res, err := db.Exec(query, sdate, edate, stime, etime, name)
		if err != nil {
			fmt.Printf("Error syncing %s: %v\n", name, err)
		} else {
			n, _ := res.RowsAffected()
			fmt.Printf("Blocked %d slots for %s\n", n, name)
		}
	}
}
