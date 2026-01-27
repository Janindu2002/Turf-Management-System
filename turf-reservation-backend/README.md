# Turf Reservation Backend

Hockey turf reservation system backend built with Go and PostgreSQL.

## Project Structure

```
turf-reservation-backend/
├── cmd/
│   └── server/        # Application entry point
├── internal/
│   ├── config/        # Configuration management
│   ├── database/      # Database connection
│   ├── handlers/      # HTTP request handlers
│   ├── middleware/    # HTTP middleware
│   ├── models/        # Data models
│   ├── repositories/  # Data access layer
│   ├── routes/        # Route definitions
│   ├── services/      # Business logic
│   └── utils/         # Utility functions
└── migrations/        # Database migrations
```

## Prerequisites

- Go 1.25.6 or higher
- PostgreSQL 14+
- Make (optional)

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   - Database credentials
   - JWT secret key
   - Server port

## Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE turf_reservation;
   ```

2. Run migrations in order:
   ```bash
   psql -U postgres -d turf_reservation -f migrations/001_users.sql
   psql -U postgres -d turf_reservation -f migrations/002_timeslots.sql
   psql -U postgres -d turf_reservation -f migrations/003_bookings.sql
   psql -U postgres -d turf_reservation -f migrations/004_teams.sql
   ```

## Installation

1. Install dependencies:
   ```bash
   go mod download
   ```

2. Build the application:
   ```bash
   go build -o bin/server ./cmd/server
   ```

## Running the Application

### Development mode:
```bash
go run cmd/server/main.go
```

### Production mode:
```bash
./bin/server
```

The server will start on the port specified in `.env` (default: 8080).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Timeslots
- `GET /api/timeslots` - Get all timeslots
- `GET /api/availability` - Check availability
- `POST /api/timeslots` - Create timeslot (Admin only)
- `PUT /api/timeslots/:id` - Update timeslot (Admin only)
- `DELETE /api/timeslots/:id` - Delete timeslot (Admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (Admin only)
- `GET /api/bookings/my` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team (Coach only)
- `POST /api/teams/:id/join` - Join team
- `DELETE /api/teams/:id/leave` - Leave team

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/reports` - Get reports and analytics

## Development

### Code Structure Guidelines

- **Models**: Define data structures
- **Repositories**: Handle database operations
- **Services**: Implement business logic
- **Handlers**: Process HTTP requests/responses
- **Middleware**: Handle authentication, logging, etc.

### Environment Variables

See `.env.example` for all available configuration options.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin, Coach, Player)
- SQL injection prevention via parameterized queries

## Sport-Specific

This system is designed specifically for **Hockey** bookings:
- Team size: 11 players
- Minimum players: 6
- Dedicated hockey turf reservation management

## License

Proprietary - Astro Turf Reservation System
