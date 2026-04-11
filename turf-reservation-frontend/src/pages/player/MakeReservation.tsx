import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, CheckCircle2, Loader2, AlertCircle, User, Users, Star } from "lucide-react";
import client from "@/api/client";
import { bookingAPI } from "@/api/booking";
import { getAllCoaches } from "@/api/coach";
import type { CoachPublicProfile } from "@/api/coach";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

/* =======================
   Types
======================= */
interface TimeSlot {
    time_slot_id: number;
    start_time: string;
    end_time: string;
    status: "available" | "booked" | "blocked";
    blocked_reason?: string;
}

export default function MakeReservation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useAuth(); // Protect route

    // Reschedule mode
    const rescheduleId = searchParams.get("reschedule");
    const isRescheduling = !!rescheduleId;

    // State
    const [date, setDate] = useState("");
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

    // Coach Selection State
    const [needsCoach, setNeedsCoach] = useState(false);
    const [allCoaches, setAllCoaches] = useState<CoachPublicProfile[]>([]);
    const [availableCoaches, setAvailableCoaches] = useState<CoachPublicProfile[]>([]);
    const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
    const [loadingCoaches, setLoadingCoaches] = useState(false);

    // UI States
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial load for rescheduling
    useEffect(() => {
        const loadRescheduleData = async () => {
            if (isRescheduling && rescheduleId) {
                try {
                    const booking = await bookingAPI.getBooking(Number(rescheduleId));
                    if (booking.slot_date) setDate(booking.slot_date);
                    setSelectedSlotId(booking.time_slot_id);
                    if (booking.coach_id) {
                        setNeedsCoach(true);
                        setSelectedCoachId(booking.coach_id);
                    }
                    if (booking.slot_date) {
                        fetchSlots(booking.slot_date);
                    }
                } catch (err) {
                    console.error("Error loading reschedule data:", err);
                }
            }
        };
        loadRescheduleData();
    }, [isRescheduling, rescheduleId]);

    /* =======================
       Helpers
    ======================= */
    const formatTime = (time24: string) => {
        const [h, m] = time24.split(":");
        const hour = Number(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
    };

    // Generate static 8am-9pm slots if API isn't ready, 
    // OR fetch from API (Recommended pattern used below)
    const fetchSlots = async (selectedDate: string) => {
        setLoading(true);
        setError(null);
        setSlots([]);

        try {
            // Fetching availability for the specific date
            const res = await client.get(`/api/availability?date=${selectedDate}`);
            setSlots(res.data || []);
        } catch (err) {
            console.error(err);
            // Fallback error or empty state
            setError("Could not load slots. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    // Handle Date Change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setDate(newDate);
        setSelectedSlotId(null);
        setSelectedCoachId(null);
        if (newDate) {
            fetchSlots(newDate);
        }
    };

    // Helper: Check Coach Availability
    const isCoachAvailable = (coach: CoachPublicProfile, selectedDate: string, slotStartTime: string) => {
        if (!coach.availability || !coach.availability.includes("|")) return false;

        try {
            const [daysPart, timePart] = coach.availability.split("|");
            const [startLimit, endLimit] = timePart.split("-");

            // Check Day
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const dayOfWeek = dayNames[new Date(selectedDate).getDay()];
            if (!daysPart.includes(dayOfWeek)) return false;

            // Check Time (Very simple string comparison works for HH:MM format)
            return slotStartTime >= startLimit && slotStartTime < endLimit;
        } catch (e) {
            return false;
        }
    };

    // Fetch Coaches
    useEffect(() => {
        if (needsCoach && allCoaches.length === 0) {
            const fetchCoaches = async () => {
                setLoadingCoaches(true);
                try {
                    const data = await getAllCoaches();
                    setAllCoaches(data);
                } catch (err) {
                    console.error("Failed to fetch coaches", err);
                } finally {
                    setLoadingCoaches(false);
                }
            };
            fetchCoaches();
        }
    }, [needsCoach, allCoaches.length]);

    // Update available coaches whenever slot or needsCoach changes
    useEffect(() => {
        if (!needsCoach || !date || !selectedSlotId) {
            setAvailableCoaches([]);
            return;
        }

        const slot = slots.find(s => s.time_slot_id === selectedSlotId);
        if (!slot) return;

        const filtered = allCoaches.filter(c => isCoachAvailable(c, date, slot.start_time));
        setAvailableCoaches(filtered);
    }, [needsCoach, date, selectedSlotId, allCoaches, slots]);

    // Submit Booking
    const handleBooking = async () => {
        if (!selectedSlotId || !date) return;

        setSubmitting(true);
        try {
            const selectedCoach = availableCoaches.find(c => c.user_id === selectedCoachId);
            const coachRate = needsCoach && selectedCoach ? selectedCoach.hourly_rate : 0;

            if (isRescheduling) {
                // PUT request to reschedule
                await bookingAPI.rescheduleBooking(
                    Number(rescheduleId), 
                    selectedSlotId, 
                    needsCoach ? selectedCoachId : null,
                    2500 + coachRate
                );
            } else {
                // POST request to create the booking
                await bookingAPI.createBooking({
                    time_slot_id: selectedSlotId,
                    total_price: 2500 + coachRate,
                    coach_id: needsCoach ? selectedCoachId : null,
                });
            }

            // On success, redirect to dashboard
            navigate(ROUTES.PLAYER_DASHBOARD);
        } catch (err: any) {
            console.error("Booking error details:", err);
            const serverMsg = err.response?.data?.error || err.message;
            setError(`Failed to ${isRescheduling ? 'reschedule' : 'complete'} reservation: ${serverMsg}`);
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                        <span className="font-bold text-xl text-gray-900">Astro Turf</span>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.PLAYER_DASHBOARD)}
                        className="text-gray-600 hover:text-emerald-600 font-medium text-sm flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isRescheduling ? "Reschedule Reservation" : "Make a Reservation"}
                    </h1>
                    <p className="text-gray-600">
                        {isRescheduling
                            ? "Select a new date and time for your booking."
                            : "Select a date and time to book your game."}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    {/* Left Column: Date Selection */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Select Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    className="w-full pl-10 py-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Bookings open 8:00 AM - 9:00 PM
                            </p>
                        </div>

                        {/* Coach Toggle */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${needsCoach ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-700">Book a Coach?</span>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Optional Add-on</span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={needsCoach}
                                    onChange={(e) => {
                                        setNeedsCoach(e.target.checked);
                                        if (!e.target.checked) setSelectedCoachId(null);
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* Summary / Confirmation Box */}
                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                            <h3 className="font-bold text-emerald-900 mb-4">Booking Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-emerald-700">Date:</span>
                                    <span className="font-medium">{date || "--"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-emerald-700">Time:</span>
                                    <span className="font-medium">
                                        {selectedSlotId
                                            ? formatTime(slots.find(s => s.time_slot_id === selectedSlotId)?.start_time || "")
                                            : "--"}
                                    </span>
                                </div>
                                {needsCoach && selectedCoachId && (
                                    <div className="flex justify-between items-start animate-in fade-in slide-in-from-top-1 duration-200">
                                        <span className="text-emerald-700">Coach:</span>
                                        <div className="text-right">
                                            <span className="font-medium block">{availableCoaches.find(c => c.user_id === selectedCoachId)?.name}</span>
                                            <span className="text-[10px] text-emerald-600 font-bold uppercase">LKR {availableCoaches.find(c => c.user_id === selectedCoachId)?.hourly_rate.toLocaleString()} /hr</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-emerald-200 pt-3 mt-3">
                                    <span className="font-bold text-emerald-900">Total:</span>
                                    <span className="font-bold text-emerald-900 text-lg">
                                        LKR {(2500 + (needsCoach && selectedCoachId ? (availableCoaches.find(c => c.user_id === selectedCoachId)?.hourly_rate || 0) : 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={!selectedSlotId || (needsCoach && !selectedCoachId) || submitting}
                                className={`
                                    w-full mt-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                                    ${!selectedSlotId || (needsCoach && !selectedCoachId) || submitting
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg scale-100 hover:scale-[1.02]"}
                                `}
                            >
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><CheckCircle2 className="w-5 h-5" /> {isRescheduling ? "Confirm Reschedule" : "Confirm Booking"}</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Time Slots */}
                    <div className="md:col-span-2">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        {!date ? (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 bg-gray-50/50">
                                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                                <p>Please select a date to view available times</p>
                            </div>
                        ) : loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="font-bold text-gray-800 mb-4">Available Slots</h3>

                                {slots && slots.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No slots available for this date.</p>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {slots?.map((slot) => {
                                            const isSelected = selectedSlotId === slot.time_slot_id;
                                            const isUnavailable = slot.status === "booked" || slot.status === "blocked";

                                            return (
                                                <button
                                                    key={slot.time_slot_id}
                                                    disabled={isUnavailable}
                                                    onClick={() => setSelectedSlotId(slot.time_slot_id)}
                                                    className={`
                                                        py-3 px-2 rounded-lg text-sm font-semibold border transition-all flex flex-col items-center justify-center gap-1 min-h-[72px] text-center
                                                        ${isUnavailable
                                                            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105 ring-2 ring-emerald-200"
                                                                : "bg-white text-gray-700 border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                                                        }
                                                    `}
                                                >
                                                    <Clock className={`w-4 h-4 ${isSelected ? "text-emerald-100" : "text-gray-400"}`} />
                                                    <span className={isUnavailable ? "line-through" : ""}>{formatTime(slot.start_time)}</span>
                                                    {isUnavailable && (
                                                        <span className="text-[9px] uppercase font-bold text-emerald-600 leading-tight px-1">
                                                            {slot.status === 'blocked' ? (slot.blocked_reason || "Maintenance") : (slot.blocked_reason || "Reserved")}
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Coach Selection Grid */}
                        {needsCoach && (
                            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Available Coaches</h3>
                                        <p className="text-xs text-gray-500">Pick a coach available during your selected time</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                        <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Pro Verified</span>
                                    </div>
                                </div>

                                {!selectedSlotId ? (
                                    <div className="py-10 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                                        <Clock className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-sm">Select a time slot first to see available coaches</p>
                                    </div>
                                ) : loadingCoaches ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                        <p className="text-sm text-gray-500">Finding your perfect match...</p>
                                    </div>
                                ) : availableCoaches.length === 0 ? (
                                    <div className="py-10 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border">
                                        <User className="w-10 h-10 text-gray-300 mb-2" />
                                        <p className="text-sm font-medium text-gray-600">No coaches available for this slot</p>
                                        <p className="text-xs text-gray-400 mt-1">Try selecting a different time or date</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {availableCoaches.map((coach) => (
                                            <button
                                                key={coach.user_id}
                                                onClick={() => setSelectedCoachId(coach.user_id)}
                                                className={`
                                                    p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 relative overflow-hidden group
                                                    ${selectedCoachId === coach.user_id
                                                        ? "bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-100"
                                                        : "bg-white border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm transition-colors
                                                    ${selectedCoachId === coach.user_id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}
                                                `}>
                                                    {coach.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 truncate mb-0.5">{coach.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-2">{coach.specialization || "Expert Coach"}</p>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="text-sm font-bold text-emerald-700">LKR {coach.hourly_rate.toLocaleString()}<span className="text-[10px] font-normal text-gray-400">/hr</span></span>
                                                        {selectedCoachId === coach.user_id && (
                                                            <div className="bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Background decoration */}
                                                <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:scale-110 transition-transform">
                                                    <Users className="w-16 h-16 text-black" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}