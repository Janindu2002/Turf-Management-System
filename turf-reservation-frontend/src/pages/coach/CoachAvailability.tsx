import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Clock, Briefcase, CheckCircle, RotateCcw } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";
import { getCoachProfile, updateCoachProfile } from "@/api/coach";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Converts "Mon,Wed,Fri" ↔ string[] */
const parseDays = (str: string): string[] =>
    str ? str.split(",").map((d) => d.trim()).filter(Boolean) : [];
const serializeDays = (days: string[]): string => days.join(",");

/** Converts "16:00-20:00" ↔ {start, end} */
const parseHours = (str: string): { start: string; end: string } => {
    const [start = "09:00", end = "17:00"] = str ? str.split("-") : [];
    return { start, end };
};
const serializeHours = (start: string, end: string): string => `${start}-${end}`;

export default function CoachAvailability() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
    const [startTime, setStartTime] = useState("16:00");
    const [endTime, setEndTime] = useState("20:00");
    const [rate, setRate] = useState("1500");
    const [specialization, setSpecialization] = useState("");

    // Load existing profile on mount
    useEffect(() => {
        getCoachProfile()
            .then((profile) => {
                if (profile.availability) {
                    const parts = profile.availability.split("|");
                    const days = parseDays(parts[0] ?? "");
                    const hours = parseHours(parts[1] ?? "");
                    setSelectedDays(days);
                    setStartTime(hours.start || "09:00");
                    setEndTime(hours.end || "17:00");
                }
                // Pre-fill existing configurations
                if (profile.specialization) setSpecialization(profile.specialization);
                if (profile.hourly_rate) setRate(String(profile.hourly_rate));
            })
            .catch(() => {
                // First-time coach, use safe defaults
                setSelectedDays(["Mon", "Wed", "Fri"]);
                setStartTime("09:00");
                setEndTime("17:00");
                setRate("");
                setSpecialization("");
            })
            .finally(() => setFetching(false));
    }, []);

    const toggleDay = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleClearSelections = () => {
        if (!window.confirm("Are you sure you want to clear all selections? This will reset all fields.")) return;
        setSelectedDays([]);
        setStartTime("00:00");
        setEndTime("00:00");
        setRate("");
        setSpecialization("");
    };

    const handleSave = async () => {
        setError(null);
        setSaved(false);

        // --- Validation ---
        if (selectedDays.length === 0) {
            setError("Please select at least one working day.");
            return;
        }

        if (startTime < "08:00" || endTime > "21:00") {
            setError("Operating hours must be between 08:00 AM and 09:00 PM.");
            return;
        }

        if (startTime >= endTime) {
            setError("End time must be after start time.");
            return;
        }

        if (!specialization.trim()) {
            setError("Please enter your coaching specialization.");
            return;
        }

        const hourlyRate = parseFloat(rate);
        if (isNaN(hourlyRate) || hourlyRate <= 0) {
            setError("Please enter a valid hourly rate (greater than 0).");
            return;
        }
        // --- End Validation ---

        setLoading(true);
        try {
            const availability = `${serializeDays(selectedDays)}|${serializeHours(startTime, endTime)}`;
            await updateCoachProfile({
                specialization: specialization.trim(),
                availability,
                hourly_rate: hourlyRate,
            });
            setSaved(true);
            setTimeout(() => navigate(ROUTES.COACH_DASHBOARD), 1200);
        } catch (err: any) {
            setError(err.message || "Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
        );
    }

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

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}
                {saved && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Availability saved! Redirecting…
                    </div>
                )}

                <div className="space-y-6">

                    {/* Working Days */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 text-lg">Working Days</h3>
                            <button
                                onClick={handleClearSelections}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Clear All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day) => (
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

                    {/* Specialization */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" /> Specialization
                        </h3>
                        <input
                            type="text"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="e.g. Hockey Goalkeeper, Field Hockey, Fitness Training..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                        />
                        <p className="text-xs text-gray-400 mt-2">Describe your coaching area or expertise shown to players.</p>
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
                        disabled={loading || saved}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Availability</>}
                    </button>

                </div>
            </main>
        </div>
    );
}