import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Calendar, Trophy, Users } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

export default function BookingApprovals() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"practice" | "tournament">("practice");

    // Mock Data
    const bookings = [
        { id: 1, type: "practice", team: "Red Lions", date: "2023-11-05", time: "16:00 - 18:00", status: "Pending" },
        { id: 2, type: "tournament", name: "Winter Cup", organizer: "Colombo FC", date: "2023-12-01", teams: 8, status: "Pending" },
        { id: 3, type: "practice", team: "Blue Whales", date: "2023-11-06", time: "18:00 - 19:00", status: "Pending" },
    ];

    const filteredBookings = bookings.filter(b => b.type === activeTab);

    return (
        <div className="min-h-screen bg-gray-50">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Booking Requests</h2>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b">
                    <button
                        onClick={() => setActiveTab("practice")}
                        className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'practice' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users className="w-4 h-4" /> Practice Matches
                    </button>
                    <button
                        onClick={() => setActiveTab("tournament")}
                        className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'tournament' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Trophy className="w-4 h-4" /> Tournaments
                    </button>
                </div>

                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {booking.type === 'practice' ? booking.team : booking.name}
                                </h3>
                                <div className="text-sm text-gray-600 mt-1 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {booking.date}
                                        {booking.type === 'practice' && <span className="text-gray-400">| {booking.time}</span>}
                                    </div>
                                    {booking.type === 'tournament' && (
                                        <span className="text-purple-600 font-semibold">Organizer: {booking.organizer} ({booking.teams} Teams)</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2">
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                                <button className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                                    <CheckCircle2 className="w-4 h-4" /> Approve
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredBookings.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No pending requests in this category.</p>
                    )}
                </div>
            </main>
        </div>
    );
}