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

    // Events state
    const [pendingEvents, setPendingEvents] = useState<EventResponse[]>([]);
    const [allEvents, setAllEvents] = useState<EventResponse[]>([]);
    const [eventTab, setEventTab] = useState<"pending" | "history">("pending");
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);

    // Details Modal State
    const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

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

    const fetchEvents = async () => {
        try {
            setEventsLoading(true);
            setEventsError(null);
            const [pending, history] = await Promise.all([
                eventAPI.getPendingEvents(),
                eventAPI.getAllEvents()
            ]);
            setPendingEvents(pending || []);
            // Filter history to show approved/rejected for transparency, or just approved
            setAllEvents(history || []);
        } catch (err: any) {
            console.error("Failed to fetch events:", err);
            const detail = err.response?.data?.error || err.message || "Unknown error";
            setEventsError(`Could not load events: ${detail}`);
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingBookings();
        fetchEvents();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await bookingAPI.approveBooking(id);
            setPendingBookings(prev => prev.filter(b => b.booking_id !== id));
        } catch (err) {
            console.error("Failed to approve booking:", err);
            alert("Failed to approve booking. Please try again.");
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm("Are you sure you want to reject this booking?")) return;
        try {
            await bookingAPI.rejectBooking(id);
            setPendingBookings(prev => prev.filter(b => b.booking_id !== id));
        } catch (err) {
            console.error("Failed to reject booking:", err);
            alert("Failed to reject booking. Please try again.");
        }
    };

    const handleApproveEvent = async (id: number) => {
        try {
            await eventAPI.approveEvent(id);
            setPendingEvents(prev => prev.filter(e => e.event_id !== id));
            fetchEvents(); // Refresh history
            if (selectedEvent?.event_id === id) setSelectedEvent(null);
        } catch (err) {
            console.error("Failed to approve event:", err);
            alert("Failed to approve event. Please try again.");
        }
    };

    const handleRejectEvent = async (id: number) => {
        if (!window.confirm("Reject this event request?")) return;
        try {
            await eventAPI.rejectEvent(id);
            setPendingEvents(prev => prev.filter(e => e.event_id !== id));
            fetchEvents(); // Refresh history
            if (selectedEvent?.event_id === id) setSelectedEvent(null);
        } catch (err) {
            console.error("Failed to reject event:", err);
            alert("Failed to reject event. Please try again.");
        }
    };

    const handleCancelEvent = async (id: number) => {
        if (!window.confirm("Are you sure you want to CANCEL this approved event? Reserved slots will be released immediately.")) return;
        try {
            await eventAPI.cancelEvent(id);
            // Refresh events to show updated status
            fetchEvents();
            // Update selected event status in modal or close it
            setSelectedEvent(prev => prev ? { ...prev, status: 'cancelled' } : null);
        } catch (err: any) {
            console.error("Failed to cancel event:", err);
            const detail = err.response?.data?.error || err.message || "Unknown error";
            alert(`Failed to cancel event: ${detail}`);
        }
    };

    const displayedEvents = eventTab === "pending" ? pendingEvents : allEvents;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Modal for Event Details */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden border">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Tournament Details</h2>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Status Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.event_name}</h3>
                                    <p className="text-purple-600 font-bold uppercase tracking-widest text-xs mt-1">{selectedEvent.event_type}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${selectedEvent.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    selectedEvent.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {selectedEvent.status}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schedule Information</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <CalendarDays className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-bold">{selectedEvent.start_date === selectedEvent.end_date ? selectedEvent.start_date : `${selectedEvent.start_date} to ${selectedEvent.end_date}`}</p>
                                                <p className="text-[10px] text-gray-400">Date Range</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Clock className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-bold">{selectedEvent.start_time} to {selectedEvent.end_time}</p>
                                                <p className="text-[10px] text-gray-400">Time Slot</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Host Information</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Users className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-bold">{selectedEvent.player_name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-gray-400">{selectedEvent.player_email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Trophy className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-bold">{selectedEvent.expected_participants} Expected</p>
                                                <p className="text-[10px] text-gray-400">Participants</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-5 bg-gray-50 rounded-xl border">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                                    <p className="text-sm text-gray-700 leading-relaxed italic">"{selectedEvent.description || 'No description provided.'}"</p>
                                </div>

                                {selectedEvent.requirements && (
                                    <div className="p-5 bg-yellow-50/50 rounded-xl border border-yellow-100">
                                        <label className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest block mb-2">Special Requirements</label>
                                        <p className="text-sm text-gray-700">{selectedEvent.requirements}</p>
                                    </div>
                                )}
                            </div>

                            {selectedEvent.status === 'pending' && (
                                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                                    <button
                                        onClick={() => handleRejectEvent(selectedEvent.event_id)}
                                        className="flex-1 py-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" /> Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleApproveEvent(selectedEvent.event_id)}
                                        className="flex-1 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> Approve Event
                                    </button>
                                </div>
                            )}

                            {selectedEvent.status === 'approved' && (
                                <div className="pt-4 sticky bottom-0 bg-white">
                                    <button
                                        onClick={() => handleCancelEvent(selectedEvent.event_id)}
                                        className="w-full py-4 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" /> Cancel Approved Event
                                    </button>
                                    <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-widest font-bold">Release reserved slots immediately upon cancellation</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                        <p className="text-gray-500 text-sm mt-1">Manage single matches and major tournaments.</p>
                    </div>
                    {!loading && activeTab === 'practice' && (
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

                {activeTab === "practice" && error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {activeTab === "practice" && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                <p>Loading requests...</p>
                            </div>
                        ) : pendingBookings.length === 0 ? (
                            <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-dashed">
                                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <p className="font-semibold text-lg text-gray-900">All caught up!</p>
                                <p className="text-sm">No pending practice bookings.</p>
                            </div>
                        ) : (
                            pendingBookings.map((booking, index) => (
                                <div key={booking.booking_id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-purple-200 transition-colors">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">{booking.player_name || `User #${booking.user_id}`}</h3>
                                            <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {booking.slot_date}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {booking.start_time} - {booking.end_time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button onClick={() => handleReject(booking.booking_id)} className="flex-1 sm:flex-none px-4 py-2 text-red-600 font-bold text-sm rounded-lg hover:bg-red-50">Reject</button>
                                        <button onClick={() => handleApprove(booking.booking_id)} className="flex-1 sm:flex-none px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm shadow-sm transition-all">Approve</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "tournament" && (
                    <div className="space-y-6">
                        {/* Internal Sub-tabs for Events */}
                        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setEventTab("pending")}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${eventTab === 'pending' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Pending Requests
                            </button>
                            <button
                                onClick={() => setEventTab("history")}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${eventTab === 'history' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All Events
                            </button>
                        </div>

                        {eventsError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{eventsError}</p>
                            </div>
                        )}

                        {eventsLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                <p>Loading tournament data...</p>
                            </div>
                        ) : displayedEvents.length === 0 ? (
                            <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-dashed">
                                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="font-semibold text-lg text-gray-900">No events found</p>
                                <p className="text-sm">There are no {eventTab} tournament requests.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {displayedEvents.map((event) => (
                                    <div
                                        key={event.event_id}
                                        className="bg-white p-5 rounded-2xl shadow-sm border hover:border-purple-400 cursor-pointer transition-all group relative overflow-hidden"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        {event.status === 'approved' && <div className="absolute top-0 right-0 w-12 h-12 bg-green-500 flex items-center justify-center translate-x-1/2 -translate-y-1/2 rotate-45 shadow-sm"><CheckCircle2 className="w-4 h-4 text-white -rotate-45 mb-1 mr-1" /></div>}

                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-bold text-gray-900 leading-none">{event.event_name}</h4>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 uppercase tracking-tighter">
                                                        {event.event_type}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 font-medium mb-3">By {event.player_name || 'Anonymous'}</p>

                                                <div className="flex flex-wrap gap-4 text-[11px] text-gray-600 font-bold">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                                                        {event.start_date}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                                                        {event.start_time} - {event.end_time}
                                                    </div>
                                                    <div className={`px-2 py-0.5 rounded uppercase tracking-wider text-[9px] ${event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        event.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {event.status}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2 bg-gray-50 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                <Trophy className="w-5 h-5 flex-shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}