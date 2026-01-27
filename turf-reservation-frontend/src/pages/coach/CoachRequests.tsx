import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, User, MessageSquare } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

export default function CoachRequests() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([
        { id: 1, name: "Dilshan M.", type: "1-on-1 Coaching", message: "Need help improving my penalty kicks.", date: "Requested 2 hours ago" },
        { id: 2, name: "Under-19 Local Team", type: "Team Strategy", message: "Looking for a coach for our weekend tournament.", date: "Requested yesterday" },
    ]);

    const handleAction = (id: number, action: "accepted" | "declined") => {
        // API logic would go here
        setRequests(prev => prev.filter(r => r.id !== id));
        alert(`Request ${action}`);
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
                    <h1 className="text-3xl font-bold text-gray-900">Pending Requests</h1>
                    <p className="text-gray-600">Review players and teams who want to book your time.</p>
                </div>

                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
                        <p>No pending requests at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{req.name}</h3>
                                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{req.type}</span>
                                            <p className="text-xs text-gray-400 mt-1">{req.date}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border mb-6 flex gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-600 italic">"{req.message}"</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(req.id, "declined")}
                                        className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" /> Decline
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, "accepted")}
                                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> Accept Request
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}