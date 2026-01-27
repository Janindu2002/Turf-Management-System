import { useNavigate } from "react-router-dom";
import {
    CalendarCheck,
    Users,
    Clock,
    LogOut,
    CalendarDays,
    Inbox,
    Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import { ROUTES } from "@/constants";

import logo from "../../assets/logo.jpeg";

export default function CoachDashboard() {
    const navigate = useNavigate();
    const { logout: handleLogout } = useAuth();

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

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card title="Upcoming Sessions" value="5" icon={<CalendarCheck />} color="blue" />
                    <Card title="Players Trained" value="14" icon={<Users />} color="blue" />
                    <Card title="Hours Coached" value="26" icon={<Clock />} color="blue" />
                </div>

                {/* Main Navigation Sections */}
                <div className="grid md:grid-cols-3 gap-6">

                    {/* 1. Schedule */}
                    <Section title="My Schedule">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    View your upcoming training sessions and managed team events.
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-xs font-semibold text-gray-700">Next: Today 4:00 PM</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.COACH_SCHEDULE)}
                                className="mt-4 w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all"
                            >
                                <CalendarDays className="w-4 h-4" /> View Schedule
                            </button>
                        </div>
                    </Section>

                    {/* 2. Requests */}
                    <Section title="Player Requests">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Manage requests from players seeking 1-on-1 coaching or team management.
                                </p>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">2 Pending</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.COACH_REQUESTS)}
                                className="mt-4 w-full bg-white text-blue-600 border border-blue-200 font-bold py-2 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 transition-all"
                            >
                                <Inbox className="w-4 h-4" /> View Requests
                            </button>
                        </div>
                    </Section>

                    {/* 3. Availability */}
                    <Section title="Availability">
                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Set your coaching hours and block out dates for leave.
                                </p>
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded text-xs text-gray-600">
                                    <Clock className="w-3 h-3" /> Mon-Fri: 16:00 - 20:00
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.COACH_AVAILABILITY)}
                                className="mt-4 w-full bg-gray-900 text-white font-bold py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 transition-all"
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