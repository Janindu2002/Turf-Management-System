import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, Clock, CheckCircle2 } from "lucide-react";
import availabilityAPI from "../api/availability.ts";
import { useAuth } from "@/context/AuthContext";
import logo from "../assets/logo.jpeg";
import type { Timeslot } from "../types";

/* =======================
   Component
======================= */
export default function LandingPage() {
    const navigate = useNavigate();
    useAuth();

    const [date, setDate] = useState("");
    const [slots, setSlots] = useState<Timeslot[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set initial date to empty so slots are hidden on load
    useEffect(() => {
        // We don't fetch automatically anymore to keep slots hidden until user interaction
        setDate("");
    }, []);

    /* =======================
       Helpers
    ======================= */
    const formatTime = (time24: string) => {
        const [h, m] = time24.split(":");
        const hour = Number(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
    };

    /* =======================
       API
    ======================= */
    const fetchSlots = async (selectedDate: string) => {
        if (!selectedDate) return;

        setLoading(true);
        setError(null);
        setSelectedSlotId(null);

        try {
            const data = await availabilityAPI.getAvailability(selectedDate);
            setSlots(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load slots. Please try again.");
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    /* =======================
       Render
    ======================= */
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-50">
                <div className="w-full px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="Astro Turf Logo"
                            className="h-10 w-10 object-contain"
                        />
                        <span className="font-bold text-xl">Astro Turf</span>
                    </div>
                    <div className="flex gap-4 text-sm font-semibold">
                        <button onClick={() => navigate("/login")} className="text-gray-600 hover:text-emerald-600">
                            Login
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700"
                        >
                            Register
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            {/* Note: This has z-10, so elements below need z-20 to sit on top */}
            <section className="relative h-[420px]">
                <img
                    src="https://img.redbull.com/images/q_auto,f_auto/redbullcom/2018/07/06/71c265d8-cab8-4dfa-8fe7-9ceee33a73e2/hockey-collection"
                    alt="Hero Background"
                    className="absolute inset-0 w-full h-full object-cover brightness-50"
                />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
                    <h1 className="text-5xl font-extrabold mb-4">Play Like a Pro</h1>
                    <p className="text-lg text-gray-200 max-w-xl">
                        Reserve your spot on Sri Lanka’s premier astro turf
                    </p>
                </div>
            </section>

            {/* Availability Card Section */}
            {/* FIX: Added 'relative z-20' to force this section ABOVE the Hero section */}
            <section className="-mt-24 max-w-5xl mx-auto px-4 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    <h2 className="text-2xl font-bold text-center mb-6">
                        Check Availability
                    </h2>

                    {/* Date + Search */}
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center mb-6">
                        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    const newDate = e.target.value;
                                    setDate(newDate);
                                    if (error) setError(null);
                                    fetchSlots(newDate);
                                }}
                                className="w-full pl-10 py-3 border rounded-xl bg-gray-50"
                            />
                        </div>

                        <button
                            onClick={() => fetchSlots(date)}
                            disabled={loading || !date}
                            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap hover:bg-gray-800 transition-colors"
                        >
                            {loading ? "Loading..." : <><Search className="w-4 h-4" /> Show Slots</>}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Slots Grid */}
                    <div className="space-y-8">
                        {!date && !loading && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Pick a date to see available slots</p>
                                <p className="text-sm">We'll show you exactly what's open for booking</p>
                            </div>
                        )}

                        {date && slots.length === 0 && !loading && !error && (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-500 font-medium">No slots found for this date.</p>
                                <p className="text-sm text-gray-400">Try selecting another day from the calendar.</p>
                            </div>
                        )}

                        {/* Available Slots Section */}
                        {date && slots.some(s => s.status === 'available') && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    Available Slots
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {slots.filter(s => s.status === 'available').map((slot) => {
                                        const selected = selectedSlotId === slot.time_slot_id;
                                        return (
                                            <button
                                                key={slot.time_slot_id}
                                                onClick={() => setSelectedSlotId(slot.time_slot_id)}
                                                className={`
                                                    py-3 rounded-lg border text-sm font-semibold flex flex-col items-center transition-all
                                                    ${selected ? "bg-emerald-600 text-white scale-105 shadow-md border-emerald-600" : "bg-white hover:border-emerald-500 hover:text-emerald-600"}
                                                `}
                                            >
                                                <Clock className={`w-4 h-4 mb-1 ${selected ? "text-emerald-100" : "text-gray-400"}`} />
                                                {formatTime(slot.start_time)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Reserved Slots Section */}
                        {date && slots.some(s => s.status === 'booked') && (
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                    Reserved Slots
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 opacity-60">
                                    {slots.filter(s => s.status === 'booked').map((slot) => (
                                        <div
                                            key={slot.time_slot_id}
                                            className="py-3 px-2 rounded-lg border bg-gray-50 text-gray-400 text-sm font-semibold flex flex-col items-center cursor-not-allowed min-h-[72px] justify-center text-center"
                                        >
                                            <Clock className="w-4 h-4 mb-1 text-gray-300" />
                                            <span className="line-through">{formatTime(slot.start_time)}</span>
                                            {slot.blocked_reason ? (
                                                <span className="text-[10px] uppercase mt-1 text-emerald-600 font-bold leading-tight">
                                                    {slot.blocked_reason}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] uppercase mt-1">Reserved</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    {selectedSlotId && (
                        <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-2">
                            <button
                                onClick={() => navigate("/login")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                Book Slot <CheckCircle2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </section >
        </div >
    );
}