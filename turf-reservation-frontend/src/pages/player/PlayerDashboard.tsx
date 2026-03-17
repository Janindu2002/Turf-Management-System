import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    LogOut,
    Plus,
    RefreshCw,
    XCircle,
    Trash2,
    UserPlus,
    Search,
    MapPin,
    Megaphone,
    Loader2,
    User,
    Trophy,
    CalendarDays
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { bookingAPI } from "@/api/booking";
import type { BookingResponse } from "@/api/booking";
import { eventAPI, type EventResponse } from "@/api/event";
import { playerAPI, type PlayerProfile } from "@/api/player";
import Section from "@/components/ui/Section";
import { ROUTES } from "@/constants";

import logo from "../../assets/logo.jpeg";

export default function PlayerDashboard() {
    const navigate = useNavigate();
    const { user, logout: handleLogout } = useAuth();

    // State
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
    const [togglingAvailability, setTogglingAvailability] = useState(false);

    const logout = async () => {
        await handleLogout();
        navigate("/", { replace: true });
    };

    // Fetch Bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingAPI.getMyBookings();
            setBookings(data || []);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
            setError("Could not load bookings.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Player Profile
    const fetchPlayerProfile = async () => {
        try {
            const data = await playerAPI.getMyProfile();
            setPlayerProfile(data);
        } catch (err) {
            console.error("Failed to fetch player profile:", err);
        }
    };

    // Fetch Events
    const fetchEvents = async () => {
        try {
            setEventsLoading(true);
            const data = await eventAPI.getMyEvents();
            setEvents(data || []);
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setEventsError("Could not load your events.");
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchEvents();
        fetchPlayerProfile();
    }, []);

    const toggleAvailability = async () => {
        const currentStatus = playerProfile?.is_available || false;
        try {
            setTogglingAvailability(true);
            const newStatus = !currentStatus;
            await playerAPI.toggleAvailability(newStatus);
            setPlayerProfile(prev => {
                if (!prev) {
                    return {
                        user_id: user?.user_id || 0,
                        name: user?.name || "",
                        email: user?.email || "",
                        is_available: newStatus,
                        is_solo_player: false
                    };
                }
                return { ...prev, is_available: newStatus };
            });
        } catch (err) {
            console.error("Failed to toggle availability:", err);
            alert("Failed to update availability.");
        } finally {
            setTogglingAvailability(false);
        }
    };

    // Handle Cancel
    const handleCancel = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await bookingAPI.cancelBooking(id);
            // Refresh bookings
            fetchBookings();
        } catch (err) {
            console.error("Failed to cancel booking:", err);
            alert("Failed to cancel booking. Please try again.");
        }
    };

    // Handle Remove (only for cancelled bookings)
    const handleRemove = async (id: number) => {
        if (!window.confirm("Remove this cancelled booking from your history?")) return;
        try {
            await bookingAPI.deleteBooking(id);
            setBookings(prev => prev.filter(b => b.booking_id !== id));
        } catch (err) {
            console.error("Failed to remove booking:", err);
            alert("Failed to remove booking. Please try again.");
        }
    };

    // Handle Remove Event (only for rejected events)
    const handleRemoveEvent = async (id: number) => {
        if (!window.confirm("Remove this rejected event request?")) return;
        try {
            await eventAPI.deleteEvent(id);
            setEvents(prev => prev.filter(e => e.event_id !== id));
        } catch (err) {
            console.error("Failed to remove event:", err);
            alert("Failed to remove event. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="Astro Turf Logo"
                            className="h-10 w-10 object-contain"
                        />
                        <h1 className="text-xl font-bold">Astro Turf</h1>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                            Player
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-red-600 font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Player Dashboard</h2>
                        <p className="text-gray-600">Welcome back! Manage your games and teams.</p>
                    </div>

                    {/* Primary Action: Make Booking */}
                    <button
                        onClick={() => navigate(ROUTES.MAKE_RESERVATION)}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5" /> Make New Reservation
                    </button>
                </div>

                {/* My Bookings Section */}
                <Section title="My Bookings">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        {loading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                <p>Loading your bookings...</p>
                            </div>
                        ) : bookings && bookings.length > 0 ? (
                            <div className="divide-y">
                                {bookings.map((booking) => (
                                    <div key={booking.booking_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">
                                                    {booking.slot_date
                                                        ? new Date(booking.slot_date + 'T00:00:00').toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })
                                                        : new Date(booking.booking_date).toLocaleDateString('en-US', {
                                                            timeZone: 'UTC',
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })
                                                    }
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {booking.start_time && booking.end_time
                                                        ? `${booking.start_time} - ${booking.end_time}`
                                                        : `Slot #${booking.time_slot_id}`}
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <MapPin className="w-3 h-3" /> Main Turf
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
                                            `}>
                                                {booking.status}
                                            </span>

                                            <div className="flex gap-2">
                                                {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`${ROUTES.MAKE_RESERVATION}?reschedule=${booking.booking_id}`)}
                                                            title="Reschedule"
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(booking.booking_id)}
                                                            title="Cancel Booking"
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'cancelled' && (
                                                    <button
                                                        onClick={() => handleRemove(booking.booking_id)}
                                                        title="Remove from history"
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                {error || "No active bookings found."}
                            </div>
                        )}
                    </div>
                </Section>

                {/* Coach Booking Section */}
                <Section title="Coach Bookings">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                            <div className="bg-blue-50 p-4 rounded-full">
                                <User className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="font-semibold text-gray-600">No coach sessions booked yet.</p>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Coach sessions you book will appear here. Browse available coaches to get started.
                            </p>
                            <button
                                className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                                onClick={() => alert("Coach booking coming soon!")}
                            >
                                Browse Coaches
                            </button>
                        </div>
                    </div>
                </Section>

                {/* My Hosted Events Section */}
                <Section title="My Hosted Events">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center text-gray-500">
                            <p className="text-[10px] font-bold uppercase tracking-wider">Recently Created</p>
                            <button
                                onClick={() => navigate(ROUTES.HOST_EVENT)}
                                className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Host New Event
                            </button>
                        </div>

                        {eventsLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                <p>Loading your events...</p>
                            </div>
                        ) : eventsError ? (
                            <div className="p-8 text-center text-red-500 bg-red-50">
                                {eventsError}
                            </div>
                        ) : events && events.length > 0 ? (
                            <div className="divide-y">
                                {events.map((event) => (
                                    <div key={event.event_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                                                <Trophy className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{event.event_name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] uppercase">
                                                        {event.event_type}
                                                    </span>
                                                    <CalendarDays className="w-3.5 h-3.5 text-gray-400 ml-1" />
                                                    {event.start_date}
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    {event.start_time}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                                ${event.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        event.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
                                            `}>
                                                {event.status}
                                            </span>

                                            {event.status === 'rejected' && (
                                                <button
                                                    onClick={() => handleRemoveEvent(event.event_id)}
                                                    title="Remove event"
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
                                <div className="bg-gray-50 p-4 rounded-full">
                                    <Megaphone className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="font-semibold text-gray-600">No events hosted yet.</p>
                                <p className="text-sm text-gray-400 max-w-sm">
                                    Want to organize a match or tournament? Start by creating your first event request.
                                </p>
                                <button
                                    onClick={() => navigate(ROUTES.HOST_EVENT)}
                                    className="mt-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                    Host an Event
                                </button>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Community & Events Section */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* 1. Solo Player Registry */}
                    <Section title="Solo Player Registry">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Looking for a game? Mark yourself as available.
                                </p>
                                <button
                                    onClick={toggleAvailability}
                                    disabled={togglingAvailability}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${playerProfile?.is_available
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                        : "bg-gray-50 border-gray-200 text-gray-700"
                                        } hover:shadow-sm`}
                                >
                                    {togglingAvailability ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <div className={`w-3 h-3 rounded-full ${playerProfile?.is_available ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-400"
                                            }`}></div>
                                    )}
                                    <span className="font-semibold flex-1 text-left">
                                        Status: <span>{playerProfile?.is_available ? "Available" : "Unavailable"}</span>
                                    </span>
                                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border font-bold uppercase tracking-wider text-gray-400">
                                        Toggle
                                    </span>
                                </button>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.JOIN_SOLO_POOL)}
                                className="mt-4 w-full border-2 border-emerald-500 text-emerald-600 font-bold py-2 rounded-lg hover:bg-emerald-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" /> {playerProfile?.is_solo_player ? "Edit Player Card" : "Join Solo Pool"}
                            </button>
                        </div>
                    </Section>

                    {/* 2. Find a Team */}
                    <Section title="Find a Team">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Browse existing teams or request to join a league.
                                </p>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">3 Hiring</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Leagues</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.FIND_TEAM)}
                                className="mt-4 w-full bg-gray-900 text-white font-bold py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" /> Browse Teams
                            </button>
                        </div>
                    </Section>

                </div>

            </main>
        </div >
    );
}