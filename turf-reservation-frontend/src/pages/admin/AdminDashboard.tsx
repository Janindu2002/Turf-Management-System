import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    LogOut,
    Calendar,
    Users,
    UserPlus,
    FileText,
    UserCog,
    CheckSquare,
    CalendarX,
    Clock,
    Loader2,
    Database,
    CheckCircle2,
    XCircle as XIcon,
    Search,
    Menu,
    X,
    BarChart3,
    Wrench,
    LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Section from "@/components/ui/Section";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";
import { availabilityAPI } from "@/api/availability";
import { bookingAPI, type BookingResponse } from "@/api/booking";
import type { Timeslot } from "@/types";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { logout: handleLogout } = useAuth();

    // Schedule State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<Timeslot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [allBookings, setAllBookings] = useState<BookingResponse[]>([]);
    const [loadingAll, setLoadingAll] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "schedule", label: "Daily Schedule", icon: Calendar },
        { id: "records", label: "Reservation Record", icon: Database },
        { id: "users", label: "User Management", icon: Users },
        { id: "operations", label: "Turf Operations", icon: Wrench },
        { id: "analytics", label: "Reports & Analytics", icon: BarChart3 },
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
        setIsSidebarOpen(false);
    };

    const filteredBookings = allBookings.filter(booking => 
        booking.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.player_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.slot_date?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchSchedule = async (date: string) => {
        try {
            setLoading(true);
            const data = await availabilityAPI.getAvailability(date);
            setSlots(data || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch schedule:", err);
            setError("Failed to load schedule for this date.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule(selectedDate);
    }, [selectedDate]);

    const fetchAllBookings = async () => {
        try {
            setLoadingAll(true);
            const data = await bookingAPI.getAllBookings();
            setAllBookings(data || []);
        } catch (err) {
            console.error("Failed to fetch all bookings:", err);
        } finally {
            setLoadingAll(false);
        }
    };

    useEffect(() => {
        fetchAllBookings();
    }, []);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const logout = async () => {
        await handleLogout();
        navigate("/", { replace: true });
    };

    const formatTime = (time24: string) => {
        const [h, m] = time24.split(":");
        const hour = Number(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <img
                            src={logo}
                            alt="Astro Turf Logo"
                            className="h-10 w-10 object-contain"
                        />
                        <h1 className="text-xl font-bold hidden sm:block">Astro Turf</h1>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                            Admin
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-red-600 font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto flex">
                {/* Sidebar Navigation */}
                <aside className={`
                    fixed lg:sticky top-16 z-20 w-64 h-[calc(100vh-64px)] bg-white border-r transition-transform duration-300
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all group"
                            >
                                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/20 z-10 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Content */}
                <main className="flex-1 px-4 sm:px-8 py-10 space-y-12 overflow-hidden" id="overview">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
                        <p className="text-gray-600">Overview of turf operations and user management.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none cursor-pointer"
                            />
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                        <div className="text-left sm:text-right">
                            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Viewing Schedule</p>
                            <p className="text-sm font-bold text-gray-900">
                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                <div id="schedule">
                    <Section title={`${selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : "Daily"} Schedule`}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-3">
                        {loading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                <p>Loading schedule...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-500 bg-red-50">
                                {error}
                            </div>
                        ) : slots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 divide-x divide-y divide-gray-100 border-b border-r border-gray-100">
                                {slots.map((slot) => (
                                    <div
                                        key={slot.time_slot_id}
                                        className={`p-4 flex flex-col items-center justify-center gap-2 transition-colors ${slot.status === 'booked' ? 'bg-purple-50' : 'bg-white hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatTime(slot.start_time)}
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${slot.status === 'booked' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {slot.status}
                                        </div>
                                        {slot.status === 'booked' && (
                                            <p className="text-[10px] text-purple-900 font-bold text-center leading-tight">
                                                {slot.blocked_reason || "Practise Session"}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No slots generated for today.</p>
                            </div>
                        )}
                    </div>
                </Section>
                </div>

                {/* Centralized Reservation Record */}
                <div id="records">
                <Section title="Centralized Reservation Record">
                    <div className="flex flex-col md:flex-row justify-end mb-4">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by player, email or date..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-3">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Player</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coach</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loadingAll ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                                                <p className="text-xs">Fetching records...</p>
                                            </td>
                                        </tr>
                                    ) : filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking) => (
                                            <tr key={booking.booking_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {booking.slot_date ? new Date(booking.slot_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "--"}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {booking.start_time} - {booking.end_time}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{booking.player_name || "Guest Player"}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium uppercase">{booking.player_email || "No email"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {booking.coach_name ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">
                                                                {booking.coach_name.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">{booking.coach_name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Turf Only</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {booking.status === 'confirmed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                        {booking.status === 'pending' && <Clock className="w-4 h-4 text-amber-500" />}
                                                        {booking.status === 'cancelled' && <XIcon className="w-4 h-4 text-red-500" />}
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-gray-900">LKR {booking.total_price?.toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                <Database className="w-10 h-10 mx-auto mb-3 opacity-10" />
                                                <p className="text-sm font-medium">
                                                    {searchTerm ? `No results found for "${searchTerm}"` : "No reservation records found."}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Section>
                </div>


                {/* Group 1: User Management */}
                <div id="users">
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
                                className="mt-4 w-full bg-white text-purple-600 border border-purple-200 font-bold py-2 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 transition-all"
                            >
                                <UserCog className="w-4 h-4" /> Manage Coaches
                            </button>
                        </div>
                    </div>
                </Section>
                </div>

                {/* Group 2: Operations */}
                <div id="operations">
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
                </div>

                {/* Group 3: Analytics */}
                <div id="analytics">
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
                </div>
            </main>
        </div>
    </div>
);
}