import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, User, Calendar } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

export default function CoachSchedule() {
    const navigate = useNavigate();

    // Mock Data
    const sessions = [
        { id: 1, type: "1-on-1 Training", client: "Nimal Perera", date: "Oct 26, 2023", time: "16:00 - 17:00", court: "Turf B", status: "confirmed" },
        { id: 2, type: "Team Drill", client: "Colombo Strikers", date: "Oct 27, 2023", time: "18:00 - 20:00", court: "Turf A", status: "confirmed" },
        { id: 3, type: "Fitness Test", client: "Saman K.", date: "Oct 29, 2023", time: "09:00 - 10:00", court: "Turf C", status: "pending" },
    ];

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
                        onClick={() => navigate(ROUTES.COACH_DASHBOARD)}
                        className="text-gray-600 hover:text-blue-600 font-medium text-sm flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                        <p className="text-gray-600">Upcoming training sessions and matches.</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="bg-white p-5 rounded-xl shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                            {/* Time & Date */}
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl text-center min-w-[80px] border">
                                    <span className="block text-xs font-bold text-gray-500 uppercase">{session.date.split(" ")[0]}</span>
                                    <span className="block text-2xl font-bold text-gray-900">{session.date.split(" ")[1].replace(",", "")}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{session.type}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <User className="w-3 h-3" /> {session.client}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.time}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {session.court}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                    ${session.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                                `}>
                                    {session.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}