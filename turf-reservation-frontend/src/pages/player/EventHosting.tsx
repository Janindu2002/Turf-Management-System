import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    Trophy,
    Users,
    Megaphone,
    CheckCircle2,
    Loader2,
    AlignLeft
} from "lucide-react";
import client from "@/api/client"; // Assumed existing client
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

/* =======================
   Types
======================= */
interface EventForm {
    eventName: string;
    eventType: string;
    date: string;
    time: string;
    expectedParticipants: string;
    description: string;
    requirements: string;
}

const EVENT_TYPES = ["Tournament", "Friendly Match", "Corporate Event", "League Day", "Training Camp"];

export default function EventHosting() {
    const navigate = useNavigate();
    useAuth();

    const [formData, setFormData] = useState<EventForm>({
        eventName: "",
        eventType: "Friendly Match",
        date: "",
        time: "",
        expectedParticipants: "",
        description: "",
        requirements: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* =======================
       Handlers
    ======================= */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate basic fields
            if (!formData.date || !formData.time || !formData.eventName) {
                throw new Error("Please fill in all required fields.");
            }

            // API Call
            await client.post("/api/events/host", formData);

            setSuccess(true);
            setTimeout(() => navigate(ROUTES.PLAYER_DASHBOARD), 2500);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create event. Please try again.");
            setLoading(false);
        }
    };

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
                        onClick={() => navigate(ROUTES.PLAYER_DASHBOARD)}
                        className="text-gray-600 hover:text-emerald-600 font-medium text-sm flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                {success ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Event Created!</h2>
                        <p className="text-gray-600 mb-8">
                            "{formData.eventName}" has been submitted for approval. We will notify you once the slot is confirmed.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.PLAYER_DASHBOARD)}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Host an Event</h1>
                            <p className="text-gray-600">
                                Organize a tournament, corporate event, or league match.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* General Info */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-emerald-600" /> Event Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Event Name</label>
                                        <input
                                            type="text"
                                            name="eventName"
                                            value={formData.eventName}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Winter Cup 2024"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-1">Event Type</label>
                                            <select
                                                name="eventType"
                                                value={formData.eventType}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                            >
                                                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-1">Expected Participants</label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="number"
                                                    name="expectedParticipants"
                                                    value={formData.expectedParticipants}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. 50"
                                                    className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-emerald-600" /> Schedule
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <AlignLeft className="w-5 h-5 text-emerald-600" /> Additional Info
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Tell us more about the event structure..."
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Special Requirements</label>
                                        <textarea
                                            name="requirements"
                                            value={formData.requirements}
                                            onChange={handleInputChange}
                                            rows={2}
                                            placeholder="e.g. Need sound system, extra floodlights, referee needed..."
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.PLAYER_DASHBOARD)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                                    ) : (
                                        <><Megaphone className="w-5 h-5" /> Host Event</>
                                    )}
                                </button>
                            </div>

                        </form>
                    </>
                )}
            </main>
        </div>
    );
}