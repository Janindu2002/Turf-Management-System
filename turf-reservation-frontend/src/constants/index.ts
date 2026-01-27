// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    COACH: 'coach',
    PLAYER: 'player',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_PLAYERS_MANAGE: '/admin/players/manage',
    ADMIN_SOLO_POOL: '/admin/players/solo-pool',
    ADMIN_COACHES_MANAGE: '/admin/coaches/manage',
    ADMIN_BOOKING_APPROVALS: '/admin/bookings/approvals',
    ADMIN_SLOTS_MANAGE: '/admin/slots/manage',
    ADMIN_REPORTS: '/admin/reports',
    COACH_DASHBOARD: '/coach/dashboard',
    COACH_SCHEDULE: '/coach/schedule',
    COACH_REQUESTS: '/coach/requests',
    COACH_AVAILABILITY: '/coach/availability',
    PLAYER_DASHBOARD: '/player/dashboard',
    MAKE_RESERVATION: '/player/book',
    JOIN_SOLO_POOL: '/player/solo-pool',
    FIND_TEAM: '/player/find-team',
    HOST_EVENT: '/player/host-event',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',

    // Timeslots
    TIMESLOTS: '/api/timeslots',
    AVAILABILITY: '/api/availability',

    // Bookings
    BOOKINGS: '/api/bookings',
    MY_BOOKINGS: '/api/bookings/my',
    CANCEL_BOOKING: '/api/bookings/:id/cancel',

    // Teams
    TEAMS: '/api/teams',
    JOIN_TEAM: '/api/teams/:id/join',
    LEAVE_TEAM: '/api/teams/:id/leave',

    // Admin
    ADMIN_STATS: '/api/admin/stats',
    ADMIN_REPORTS: '/api/admin/reports',
} as const;

// Sport Information
export const SPORT_INFO = {
    NAME: 'Hockey',
    TYPE: 'hockey',
    PLAYERS_PER_TEAM: 11,
    MIN_PLAYERS: 6,
} as const;

// Booking Status
export const BOOKING_STATUS = {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
} as const;

// Timeslot Status
export const TIMESLOT_STATUS = {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    BLOCKED: 'blocked',
} as const;

// Booking Types
export const BOOKING_TYPES = {
    SOLO: 'solo',
    TEAM: 'team',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
} as const;

// Time Constants
export const TIME_SLOTS = {
    START_HOUR: 6,  // 6 AM
    END_HOUR: 22,   // 10 PM
    SLOT_DURATION: 60, // minutes
} as const;

// Application Info
export const APP_INFO = {
    NAME: 'Astro Turf',
    DESCRIPTION: 'Professional Hockey Turf Reservation System',
} as const;
