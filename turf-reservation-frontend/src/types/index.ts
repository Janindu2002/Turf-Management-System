// User Types
export interface User {
    user_id: number;
    email: string;
    name: string;
    role: 'admin' | 'coach' | 'player';
    phone?: string;
    created_at: string;
}

// Timeslot Types
export interface Timeslot {
    time_slot_id: number;
    turf_id: number;
    date: string;
    start_time: string;
    end_time: string;
    status: 'available' | 'booked' | 'blocked';
    blocked_reason?: string;
}

// Booking Types
export interface Booking {
    id: number;
    user_id: number;
    timeslot_id: number;
    booking_type: 'solo' | 'team';
    team_id?: number;
    status: 'confirmed' | 'cancelled' | 'completed';
    total_price: number;
    created_at: string;
    user?: User;
    timeslot?: Timeslot;
    team?: Team;
}

// Team Types
export interface Team {
    id: number;
    name: string;
    coach_id: number;
    max_players: number;
    current_players: number;
    created_at: string;
    coach?: User;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// Auth Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'player' | 'coach';
    has_team?: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Availability Types
export interface AvailabilityQuery {
    date: string;
    start_time?: string;
    end_time?: string;
}

// Stats Types
export interface DashboardStats {
    total_bookings?: number;
    active_bookings?: number;
    total_revenue?: number;
    hours_played?: number;
    teams_joined?: number;
    total_players?: number;
}
