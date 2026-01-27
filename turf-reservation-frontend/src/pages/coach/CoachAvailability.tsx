import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Clock } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CoachAvailability() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // State
    const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
    const [startTime, setStartTime] = useState("16:00");
    const [endTime, setEndTime] = useState("20:00");
    const [rate, setRate] = useState("1500");

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(prev => prev.filter(d => d !== day));
        } else {
            setSelectedDays(prev => [...prev, day]);
        }
    };

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            navigate(ROUTES.COACH_DASHBOARD);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50">
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Availability Settings</h1>
                    <p className="text-gray-600">Configure when you are available for booking.</p>
                </div>

                <div className="space-y-6">

                    {/* Working Days */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4">Working Days</h3>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map(day => (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`
                                        w-12 h-12 rounded-full font-bold text-sm transition-all border
                                        ${selectedDays.includes(day)
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" /> Standard Hours
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rate */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4">Hourly Rate</h3>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">LKR</span>
                            <input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="w-full pl-14 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">This will be displayed to players booking 1-on-1 sessions.</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Availability</>}
                    </button>

                </div>
            </main>
        </div>
    );
}