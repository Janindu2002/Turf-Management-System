import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, User, Calendar, Loader2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants";
import { bookingAPI, type BookingResponse } from "@/api/booking";
import logo from "@/assets/logo.jpeg";

export default function CoachSchedule() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const data = await bookingAPI.getCoachRequests();
            // Show sessions that the coach has approved
            setSessions(data.filter(b => b.coach_approval_status === "approved"));
        } catch (err) {
            console.error("Failed to fetch coach schedule:", err);
            setError("Could not load your schedule.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                        <span className="font-bold text-xl text-gray-900">Astro Turf</span>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.COACH_DASHBOARD)}
                        className="text-gray-600 hover:text-blue-600 font-medium text-sm flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                        <p className="text-gray-600">Upcoming training sessions and matches.</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 shadow-sm">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 bg-white rounded-xl border flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-500">Loading schedule...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
                        <p className="mb-2">Your schedule is empty.</p>
                        <p className="text-sm">Approve some player requests to see them here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div key={session.booking_id} className="bg-white p-5 rounded-xl shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-200 transition-colors">

                                {/* Time & Date */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl text-center min-w-[85px] border border-blue-100">
                                        <span className="block text-xs font-bold text-blue-500 uppercase">
                                            {session.slot_date ? new Date(session.slot_date).toLocaleDateString(undefined, { month: 'short' }) : "---"}
                                        </span>
                                        <span className="block text-2xl font-black text-blue-900">
                                            {session.slot_date ? new Date(session.slot_date).getDate() : "--"}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">Coaching Session</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                                            <User className="w-3.5 h-3.5" /> {session.player_name || "Guest Player"}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.start_time} - {session.end_time}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.turf_name || "Main Turf"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                                        ${session.admin_approval_status === "approved" 
                                            ? "bg-green-50 text-green-700 border-green-100" 
                                            : "bg-yellow-50 text-yellow-700 border-yellow-100"}
                                    `}>
                                        {session.admin_approval_status === "approved" ? "Confirmed" : "Pending Admin"}
                                    </span>
                                    {session.admin_approval_status !== "approved" && (
                                        <p className="text-[9px] text-gray-400 font-bold italic">Waiting for Admin to approve turf</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}