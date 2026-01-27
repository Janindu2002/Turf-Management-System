import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    Users,
    LogOut,
    Plus,
    RefreshCw,
    XCircle,
    UserPlus,
    Search,
    MapPin,
    Megaphone
} from "lucide-react";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import { STORAGE_KEYS, ROUTES } from "@/constants";

import logo from "../../assets/logo.jpeg";

export default function PlayerDashboard() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        navigate("/");
    };

    // Dummy data to visualize the UX for Bookings
    const myBookings = [
        { id: 101, date: "2023-10-25", time: "18:00 - 19:00", court: "Turf A", status: "confirmed" },
        { id: 102, date: "2023-11-02", time: "20:00 - 21:00", court: "Turf B", status: "pending" },
    ];

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

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card title="Active Bookings" value="2" icon={<Calendar />} />
                    <Card title="Hours Played" value="18" icon={<Clock />} />
                    <Card title="Teams Joined" value="1" icon={<Users />} />
                </div>

                {/* My Bookings Section */}
                <Section title="My Bookings">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        {myBookings.length > 0 ? (
                            <div className="divide-y">
                                {myBookings.map((booking) => (
                                    <div key={booking.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{booking.date}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-3 h-3" /> {booking.time}
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <MapPin className="w-3 h-3" /> {booking.court}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                            `}>
                                                {booking.status}
                                            </span>

                                            <div className="flex gap-2">
                                                <button title="Reschedule" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button title="Cancel Booking" className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100">
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No active bookings found.
                            </div>
                        )}
                    </div>
                </Section>

                {/* Community & Events Section */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* 1. Solo Player Registry */}
                    <Section title="Solo Player Registry">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Looking for a game? Mark yourself as available.
                                </p>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    <span className="font-semibold text-gray-700">Status: <span className="text-gray-900">Unavailable</span></span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.JOIN_SOLO_POOL)}
                                className="mt-4 w-full border-2 border-emerald-600 text-emerald-700 font-bold py-2 rounded-lg hover:bg-emerald-50 flex items-center justify-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" /> Join Solo Pool
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

                    {/* 3. Host Event (New) */}
                    <Section title="Host an Event">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Organize a tournament, friendly match, or corporate day.
                                </p>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-semibold">Tournaments</span>
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">Friendlies</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.HOST_EVENT)}
                                className="mt-4 w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-2 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-2"
                            >
                                <Megaphone className="w-4 h-4" /> Create Event
                            </button>
                        </div>
                    </Section>

                </div>

            </main>
        </div >
    );
}