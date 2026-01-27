import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import client from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

/* =======================
   Types
======================= */
interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    status: "available" | "booked";
}

export default function MakeReservation() {
    const navigate = useNavigate();
    useAuth(); // Protect route

    // State
    const [date, setDate] = useState("");
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

    // UI States
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setSlots(res.data);
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
        if (newDate) {
            fetchSlots(newDate);
        }
    };

    // Submit Booking
    const handleBooking = async () => {
        if (!selectedSlotId || !date) return;

        setSubmitting(true);
        try {
            // POST request to create the booking
            await client.post("/api/bookings", {
                slot_id: selectedSlotId,
                date: date
            });

            // On success, redirect to dashboard
            navigate(ROUTES.PLAYER_DASHBOARD);
        } catch (err) {
            console.error(err);
            setError("Failed to complete reservation. Please try again.");
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
                    <h1 className="text-3xl font-bold text-gray-900">Make a Reservation</h1>
                    <p className="text-gray-600">Select a date and time to book your game.</p>
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
                                            ? formatTime(slots.find(s => s.id === selectedSlotId)?.start_time || "")
                                            : "--"}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-emerald-200 pt-3 mt-3">
                                    <span className="font-bold text-emerald-900">Total:</span>
                                    <span className="font-bold text-emerald-900">LKR 2,500</span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={!selectedSlotId || submitting}
                                className={`
                                    w-full mt-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                                    ${!selectedSlotId || submitting
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg scale-100 hover:scale-[1.02]"}
                                `}
                            >
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><CheckCircle2 className="w-5 h-5" /> Confirm Booking</>
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

                                {slots.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No slots available for this date.</p>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {slots.map((slot) => {
                                            const isSelected = selectedSlotId === slot.id;
                                            const isBooked = slot.status === "booked";

                                            return (
                                                <button
                                                    key={slot.id}
                                                    disabled={isBooked}
                                                    onClick={() => setSelectedSlotId(slot.id)}
                                                    className={`
                                                        py-3 px-2 rounded-lg text-sm font-semibold border transition-all flex flex-col items-center justify-center gap-1
                                                        ${isBooked
                                                            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105 ring-2 ring-emerald-200"
                                                                : "bg-white text-gray-700 border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                                                        }
                                                    `}
                                                >
                                                    <Clock className={`w-4 h-4 ${isSelected ? "text-emerald-100" : "text-gray-400"}`} />
                                                    {formatTime(slot.start_time)}
                                                </button>
                                            )
                                        })}
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