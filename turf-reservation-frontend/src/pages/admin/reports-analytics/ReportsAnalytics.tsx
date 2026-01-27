import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Users, DollarSign, CalendarCheck } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

export default function ReportsAnalytics() {
    const navigate = useNavigate();

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

            <main className="max-w-7xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h2>

                {/* Stat Highlights */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600"><DollarSign className="w-5 h-5" /></div>
                            <span className="text-gray-500 text-sm font-semibold">Total Revenue</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">LKR 450,000</h3>
                        <span className="text-xs text-green-600 font-bold">+12% from last month</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users className="w-5 h-5" /></div>
                            <span className="text-gray-500 text-sm font-semibold">New Players</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">24</h3>
                        <span className="text-xs text-blue-600 font-bold">+5 this week</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><CalendarCheck className="w-5 h-5" /></div>
                            <span className="text-gray-500 text-sm font-semibold">Total Bookings</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">142</h3>
                        <span className="text-xs text-gray-400">98% Fulfillment rate</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><TrendingUp className="w-5 h-5" /></div>
                            <span className="text-gray-500 text-sm font-semibold">Peak Hour</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">6:00 PM</h3>
                        <span className="text-xs text-gray-400">Friday & Saturday</span>
                    </div>
                </div>

                {/* Detailed Charts Area */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border min-h-[400px]">
                        <h3 className="font-bold text-gray-800 mb-4">Revenue Trend (Last 6 Months)</h3>
                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
                            <p className="text-gray-400 italic">Chart Visualization Component Goes Here</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4">Top Customers</h3>
                        <ul className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <li key={i} className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700">Colombo Strikers FC</span>
                                    <span className="font-bold text-purple-600">LKR 45,000</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}