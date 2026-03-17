import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    ArrowLeft,
    Save,
    Loader2,
    CheckCircle2,
    Trophy,
    Activity,
    CalendarDays
} from "lucide-react";
import { playerAPI } from "@/api/player";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

/* =======================
   Types
======================= */
interface SoloPoolForm {
    full_name: string;
    email: string;
    phone: string;
    position: string;
    skill_level: string;
    availability: string[];
    is_solo_player: boolean;
    notes: string;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const POSITIONS = ["Striker", "Midfielder", "Defender", "Goalkeeper", "All Rounder"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"];

export default function JoinSoloPool() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth(); // Assuming useAuth provides the basic user object

    // Form State
    const [formData, setFormData] = useState<SoloPoolForm>({
        full_name: "",
        email: "",
        phone: "",
        position: "",
        skill_level: "Intermediate",
        availability: [],
        is_solo_player: true,
        notes: ""
    });

    const [loading, setLoading] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* =======================
       Effects
    ======================= */
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (authLoading) return;

            setFetchingProfile(true);
            if (!user) {
                setFetchingProfile(false);
                return;
            }

            try {
                const data = await playerAPI.getMyProfile();
                setFormData(prev => ({
                    ...prev,
                    full_name: data?.name || user?.name || "",
                    email: data?.email || user?.email || "",
                    phone: data?.phone || user?.phone || "",
                    position: data?.position || "",
                    skill_level: data?.skill_level || "Intermediate",
                    availability: data?.available_days ? data.available_days.split(",") : [],
                    notes: data?.description || "",
                    is_solo_player: typeof data?.is_solo_player === 'boolean' ? data.is_solo_player : true
                }));
            } catch (err) {
                console.error("Failed to fetch profile", err);
                // Even on error, we can pre-fill from user context
                setFormData(prev => ({
                    ...prev,
                    full_name: user?.name || "",
                    email: user?.email || "",
                    phone: user?.phone || "",
                }));
            } finally {
                setFetchingProfile(false);
            }
        };

        fetchUserProfile();
    }, [user, authLoading]);

    /* =======================
       Handlers
    ======================= */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleDay = (day: string) => {
        setFormData(prev => {
            const currentDays = prev.availability;
            if (currentDays.includes(day)) {
                return { ...prev, availability: currentDays.filter(d => d !== day) };
            } else {
                return { ...prev, availability: [...currentDays, day] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validation: Ensure availability is selected
            if (formData.availability.length === 0) {
                throw new Error("Please select at least one day you are available.");
            }

            // API Call
            await playerAPI.updateProfile({
                name: formData.full_name,
                phone: formData.phone,
                position: formData.position,
                skill_level: formData.skill_level,
                available_days: formData.availability.join(","),
                description: formData.notes,
                is_solo_player: true
            });

            setSuccess(true);
            // Optional: Redirect after delay
            setTimeout(() => navigate(ROUTES.PLAYER_DASHBOARD), 2000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to join the pool. Please try again.");
            setLoading(false);
        }
    };

    if (fetchingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

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
                {/* Success State */}
                {success ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">You're on the list!</h2>
                        <p className="text-gray-600 mb-8">
                            We've added you to the solo player pool. Team captains can now see your profile and contact you for matches.
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
                            <h1 className="text-3xl font-bold text-gray-900">Join Solo Pool</h1>
                            <p className="text-gray-600">
                                Create your player card so teams can find you when they are short a player.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Section 1: Contact Info */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-emerald-600" /> Personal Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                readOnly
                                                className="w-full pl-10 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                readOnly
                                                className="w-full pl-10 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="07X XXX XXXX"
                                                className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Player Stats */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-emerald-600" /> Player Profile
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Preferred Position</label>
                                        <div className="relative">
                                            <select
                                                name="position"
                                                value={formData.position}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-3 pr-10 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                            >
                                                <option value="" disabled>Select Position</option>
                                                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Skill Level</label>
                                        <div className="relative">
                                            <select
                                                name="skill_level"
                                                value={formData.skill_level}
                                                onChange={handleInputChange}
                                                className="w-full pl-3 pr-10 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                            >
                                                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Availability & Notes */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-emerald-600" /> Logistics
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <CalendarDays className="w-5 h-5 text-emerald-600" /> Select Your Available Days
                                    </label>
                                    <p className="text-xs text-gray-500 italic">Select common days you can play so admins can group you into teams.</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                        {DAYS_OF_WEEK.map((day) => {
                                            const isSelected = formData.availability.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`
                                                        py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1
                                                        ${isSelected
                                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105"
                                                            : "bg-white text-gray-500 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50"}
                                                    `}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-gray-200"}`}></div>
                                                    {day.toUpperCase()}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Additional Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="E.g. I have my own gear, can play backup goalie..."
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Registering...</>
                                ) : (
                                    <><Save className="w-5 h-5" /> Join Pool</>
                                )}
                            </button>

                        </form>
                    </>
                )}
            </main>
        </div>
    );
}