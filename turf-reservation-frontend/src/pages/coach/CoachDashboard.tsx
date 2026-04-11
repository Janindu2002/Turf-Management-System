import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Clock,
    LogOut,
    CalendarDays,
    Inbox,
    Settings,
    Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Section from "@/components/ui/Section";
import { ROUTES } from "@/constants";
import { bookingAPI } from "@/api/booking";
import logo from "../../assets/logo.jpeg";

export default function CoachDashboard() {
    const navigate = useNavigate();
    const { logout: handleLogout } = useAuth();
    
    // Stats states
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [nextSession, setNextSession] = useState<string>("No upcoming sessions");
    const [loading, setLoading] = useState(true);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const bookings = await bookingAPI.getCoachRequests();
            
            // 1. Calculate Pending Requests
            const pending = bookings.filter(b => b.coach_approval_status === "pending").length;
            setPendingCount(pending);

            // 2. Find Next Confirmed Session
            const now = new Date();
            const confirmedBookings = bookings.filter(b => b.status === "confirmed" && b.slot_date);
            
            if (confirmedBookings.length > 0) {
                // Sort by date and time
                const sorted = confirmedBookings.sort((a, b) => {
                    const dateA = new Date(`${a.slot_date}T${a.start_time}`);
                    const dateB = new Date(`${b.slot_date}T${b.start_time}`);
                    return dateA.getTime() - dateB.getTime();
                });

                // Find first one in the future
                const upcoming = sorted.find(b => new Date(`${b.slot_date}T${b.start_time}`) > now);
                
                if (upcoming) {
                    const date = new Date(`${upcoming.slot_date}T${upcoming.start_time}`);
                    const isToday = date.toDateString() === now.toDateString();
                    const day = isToday ? "Today" : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                    setNextSession(`${day} ${timeStr}`);
                }
            }
        } catch (err) {
            console.error("Failed to fetch coach dashboard stats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const logout = async () => {
        await handleLogout();
        navigate("/", { replace: true });
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
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                            Coach
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
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Coach Dashboard</h2>
                    <p className="text-gray-600">Manage your training sessions and player roster.</p>
                </div>

                {/* Main Navigation Sections */}
                <div className="grid md:grid-cols-3 gap-6">

                    {/* 1. Schedule */}
                    <Section title="My Schedule">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between group">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    View your upcoming training sessions and managed team events.
                                </p>
                                <div className="flex items-center gap-2">
                                    {loading ? (
                                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                    ) : (
                                        <span className={`w-2 h-2 rounded-full ${nextSession !== "No upcoming sessions" ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}></span>
                                    )}
                                    <span className="text-xs font-semibold text-gray-700">
                                        Next: {loading ? "Checking..." : nextSession}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.COACH_SCHEDULE)}
                                className="mt-4 w-full bg-white text-blue-600 border border-blue-200 font-bold py-2 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 transition-all shadow-sm group-hover:border-blue-300"
                            >
                                <CalendarDays className="w-4 h-4" /> View Schedule
                            </button>
                        </div>
                    </Section>

                    {/* 2. Requests */}
                    <Section title="Player Requests">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between group">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    {loading ? "Checking for new requests..." : 
                                     (pendingCount ?? 0) > 0 ? `You have ${pendingCount} player ${pendingCount === 1 ? 'request' : 'requests'} waiting for your approval.` : 
                                     "Review players who want to book your coaching sessions."}
                                </p>
                                <div className="flex gap-2">
                                    {loading ? (
                                        <span className="text-[10px] text-gray-400">Updating...</span>
                                    ) : (pendingCount ?? 0) >= 5 ? (
                                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold shadow-md animate-pulse">
                                            {pendingCount} High Priority
                                        </span>
                                    ) : (pendingCount ?? 0) > 0 ? (
                                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold shadow-sm animate-bounce">
                                            {pendingCount} Pending
                                        </span>
                                    ) : (
                                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            All Caught Up
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.COACH_REQUESTS)}
                                className="mt-4 w-full bg-white text-blue-600 border border-blue-200 font-bold py-2 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 transition-all shadow-sm group-hover:border-blue-300"
                            >
                                <Inbox className="w-4 h-4" /> View Requests
                            </button>
                        </div>
                    </Section>

                    {/* 3. Availability */}
                    <Section title="Availability">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between group">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Set your coaching hours and block out dates for leave.
                                </p>
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded text-[10px] text-gray-500 font-bold">
                                    <Clock className="w-3 h-3 text-blue-500" /> ACTIVE SLOTS ENABLED
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.COACH_AVAILABILITY)}
                                className="mt-4 w-full bg-white text-blue-600 border border-blue-200 font-bold py-2 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 transition-all shadow-sm group-hover:border-blue-300"
                            >
                                <Settings className="w-4 h-4" /> Manage Slots
                            </button>
                        </div>
                    </Section>

                </div>
            </main>
        </div >
    );
}