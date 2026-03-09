import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Calendar, Clock, Trophy, Users, Loader2, AlertCircle, CalendarDays } from "lucide-react";
import { ROUTES } from "@/constants";
import { bookingAPI } from "@/api/booking";
import type { BookingResponse } from "@/api/booking";
import { eventAPI } from "@/api/event";
import type { EventResponse } from "@/api/event";
import logo from "@/assets/logo.jpeg";

export default function BookingApprovals() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"practice" | "tournament">("practice");

    // Practice bookings state
    const [pendingBookings, setPendingBookings] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Events state
    const [pendingEvents, setPendingEvents] = useState<EventResponse[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [eventActionLoading, setEventActionLoading] = useState<number | null>(null);

    const fetchPendingBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await bookingAPI.getPendingBookings();
            setPendingBookings(data || []);
        } catch (err: any) {
            console.error("Failed to fetch pending bookings:", err);
            setError(err.response?.data?.error || "Could not load pending bookings.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingEvents = async () => {
        try {
            setEventsLoading(true);
            setEventsError(null);
            const data = await eventAPI.getPendingEvents();
            setPendingEvents(data || []);
        } catch (err: any) {
            console.error("Failed to fetch pending events:", err);
            setEventsError(err.response?.data?.error || "Could not load pending events.");
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingBookings();
        fetchPendingEvents();
    }, []);

    const handleApprove = async (id: number) => {
        setActionLoading(id);
        try {
            await bookingAPI.approveBooking(id);
            // Remove from list after approval
            setPendingBookings(prev => prev.filter(b => b.booking_id !== id));
        } catch (err) {
            console.error("Failed to approve booking:", err);
            alert("Failed to approve booking. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm("Are you sure you want to reject this booking? The timeslot will be released.")) return;
        setActionLoading(id);
        try {
            await bookingAPI.rejectBooking(id);
            setPendingBookings(prev => prev.filter(b => b.booking_id !== id));
        } catch (err) {
            console.error("Failed to reject booking:", err);
            alert("Failed to reject booking. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveEvent = async (id: number) => {
        setEventActionLoading(id);
        try {
            await eventAPI.approveEvent(id);
            setPendingEvents(prev => prev.filter(e => e.event_id !== id));
        } catch (err) {
            console.error("Failed to approve event:", err);
            alert("Failed to approve event. Please try again.");
        } finally {
            setEventActionLoading(null);
        }
    };

    const handleRejectEvent = async (id: number) => {
        if (!window.confirm("Reject this event request?")) return;
        setEventActionLoading(id);
        try {
            await eventAPI.rejectEvent(id);
            setPendingEvents(prev => prev.filter(e => e.event_id !== id));
        } catch (err) {
            console.error("Failed to reject event:", err);
            alert("Failed to reject event. Please try again.");
        } finally {
            setEventActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">Admin</span>
                    </div>
                    <button onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)} className="text-gray-600 hover:text-purple-600 flex items-center gap-2 font-medium text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Booking Requests</h2>
                        <p className="text-gray-500 text-sm mt-1">Requests are shown in order received (oldest first).</p>
                    </div>
                    {!loading && (
                        <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
                            {pendingBookings.length} Pending
                        </span>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b">
                    <button
                        onClick={() => setActiveTab("practice")}
                        className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'practice' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users className="w-4 h-4" /> Practice Matches
                        {!loading && pendingBookings.length > 0 && (
                            <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">{pendingBookings.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("tournament")}
                        className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'tournament' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Trophy className="w-4 h-4" /> Tournaments
                        {!eventsLoading && pendingEvents.length > 0 && (
                            <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">{pendingEvents.length}</span>
                        )}
                    </button>
                </div>

                {activeTab === "practice" && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                <p>Loading booking requests...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        ) : pendingBookings.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <p className="font-semibold text-lg">All caught up!</p>
                                <p className="text-sm">No pending booking requests.</p>
                            </div>
                        ) : (
                            pendingBookings.map((booking, index) => (
                                <div key={booking.booking_id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-purple-200 transition-colors">
                                    {/* Queue Position Badge */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                {booking.player_name ?? `Player #${booking.user_id}`}
                                                <span className="text-xs font-normal text-gray-400">Booking #{booking.booking_id}</span>
                                            </h3>
                                            {booking.player_email && (
                                                <p className="text-xs text-gray-400 mb-1">{booking.player_email}</p>
                                            )}
                                            <div className="text-sm text-gray-600 mt-1 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {booking.slot_date
                                                        ? new Date(booking.slot_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                                        : new Date(booking.booking_date).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                                    }
                                                </div>
                                                {booking.start_time && booking.end_time && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {booking.start_time} – {booking.end_time}
                                                    </div>
                                                )}
                                                <span className="font-semibold text-gray-700">Rs. {booking.total_price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleReject(booking.booking_id)}
                                            disabled={actionLoading === booking.booking_id}
                                            className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading === booking.booking_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(booking.booking_id)}
                                            disabled={actionLoading === booking.booking_id}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading === booking.booking_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "tournament" && (
                    <div className="space-y-4">
                        {eventsLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                <p>Loading event requests...</p>
                            </div>
                        ) : eventsError ? (
                            <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{eventsError}</p>
                            </div>
                        ) : pendingEvents.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="font-semibold text-lg">All caught up!</p>
                                <p className="text-sm">No pending tournament or event requests.</p>
                            </div>
                        ) : (
                            pendingEvents.map((event, index) => (
                                <div key={event.event_id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-purple-200 transition-colors">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-bold text-gray-900">{event.event_name}</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                    {event.event_type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-2">
                                                By {event.player_name || 'Anonymous Player'} ({event.player_email})
                                            </p>

                                            <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                                    {event.start_date === event.end_date ? event.start_date : `${event.start_date} - ${event.end_date}`}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {event.start_time}
                                                </div>
                                                {event.expected_participants && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                                        {event.expected_participants} people
                                                    </div>
                                                )}
                                            </div>

                                            {event.description && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-dashed text-xs text-gray-600">
                                                    <p className="font-semibold text-gray-700 mb-1">Description:</p>
                                                    {event.description}
                                                </div>
                                            )}

                                            {event.requirements && (
                                                <div className="mt-2 text-[11px] text-gray-500 italic">
                                                    * Requirements: {event.requirements}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleRejectEvent(event.event_id)}
                                            disabled={eventActionLoading === event.event_id}
                                            className="flex-1 sm:flex-none px-4 py-2 border border-red-100 text-red-600 rounded-lg hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {eventActionLoading === event.event_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApproveEvent(event.event_id)}
                                            disabled={eventActionLoading === event.event_id}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                                        >
                                            {eventActionLoading === event.event_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}