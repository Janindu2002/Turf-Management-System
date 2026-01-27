import { useNavigate } from "react-router-dom";
import {
    LogOut,
    Calendar,
    BarChart3,
    Users,
    UserPlus,
    FileText,
    UserCog,
    CheckSquare,
    CalendarX
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

export default function AdminDashboard() {
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
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                            Admin
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

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
                    <p className="text-gray-600">Overview of turf operations and user management.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card title="Total Players" value="124" icon={<Users />} color="purple" />
                    <Card title="Pending Approvals" value="12" icon={<Calendar />} color="purple" />
                    <Card title="Monthly Revenue" value="LKR 120,000" icon={<BarChart3 />} color="purple" />
                </div>

                {/* Group 1: User Management */}
                <Section title="User Management">
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        {/* Player Database */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Player Database</h3>
                                <p className="text-gray-600 text-sm">Manage registered players and bans.</p>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.ADMIN_PLAYERS_MANAGE)}
                                className="mt-4 w-full bg-white text-purple-600 border border-purple-200 font-bold py-2 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 transition-all"
                            >
                                <Users className="w-4 h-4" /> Manage Players
                            </button>
                        </div>

                        {/* Solo Pool */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Solo Team Creation</h3>
                                <p className="text-gray-600 text-sm">Group solo players into teams.</p>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.ADMIN_SOLO_POOL)}
                                className="mt-4 w-full bg-white text-purple-600 border border-purple-200 font-bold py-2 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 transition-all"
                            >
                                <UserPlus className="w-4 h-4" /> Create Teams
                            </button>
                        </div>

                        {/* Coach Management */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Coach Registry</h3>
                                <p className="text-gray-600 text-sm">Verify and manage certified coaches.</p>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.ADMIN_COACHES_MANAGE)}
                                className="mt-4 w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 transition-all"
                            >
                                <UserCog className="w-4 h-4" /> Manage Coaches
                            </button>
                        </div>
                    </div>
                </Section>

                {/* Group 2: Operations */}
                <Section title="Turf Operations">
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        {/* Booking Approvals */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Booking Approvals</h3>
                                <p className="text-gray-600 text-sm">Review practice matches and tournaments.</p>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.ADMIN_BOOKING_APPROVALS)}
                                className="mt-4 w-full bg-white text-purple-600 border border-purple-200 font-bold py-2 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 transition-all"
                            >
                                <CheckSquare className="w-4 h-4" /> Review Requests
                            </button>
                        </div>

                        {/* Slot Management */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Slot Controls</h3>
                                <p className="text-gray-600 text-sm">Block slots for maintenance or events.</p>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.ADMIN_SLOTS_MANAGE)}
                                className="mt-4 w-full bg-white text-purple-600 border border-purple-200 font-bold py-2 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 transition-all"
                            >
                                <CalendarX className="w-4 h-4" /> Manage Availability
                            </button>
                        </div>
                    </div>
                </Section>

                {/* Group 3: Analytics */}
                <Section title="Reports & Analytics">
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 mt-4 shadow-lg">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Performance Overview</h3>
                            <p className="text-purple-100 max-w-xl">
                                Generate detailed reports on revenue, peak hours, and customer retention.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(ROUTES.ADMIN_REPORTS)}
                            className="bg-white text-purple-900 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 flex items-center gap-2 transition-all"
                        >
                            <FileText className="w-5 h-5" /> View Full Reports
                        </button>
                    </div>
                </Section>
            </main>
        </div>
    );
}