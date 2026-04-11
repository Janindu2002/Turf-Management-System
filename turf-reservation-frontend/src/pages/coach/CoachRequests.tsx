import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, User, MessageSquare, Loader2, Calendar, Clock } from "lucide-react";
import { ROUTES } from "@/constants";
import { bookingAPI, type BookingResponse } from "@/api/booking";
import logo from "@/assets/logo.jpeg";

export default function CoachRequests() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await bookingAPI.getCoachRequests();
            // Only show pending coach approvals
            setRequests(data.filter(r => r.coach_approval_status === "pending"));
        } catch (err) {
            console.error("Failed to fetch coach requests:", err);
            setError("Could not load player requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: number, action: "accepted" | "declined") => {
        try {
            if (action === "accepted") {
                await bookingAPI.coachApproveBooking(id);
            } else {
                await bookingAPI.coachRejectBooking(id);
            }
            // Remove from list
            setRequests(prev => prev.filter(r => r.booking_id !== id));
        } catch (err) {
            console.error(`Failed to ${action} request:`, err);
            alert(`Failed to ${action} request. Please try again.`);
        }
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
                        className="text-gray-600 hover:text-blue-600 font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Pending Requests</h1>
                    <p className="text-gray-600">Review players who want to book your time.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 bg-white rounded-xl border flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-500">Loading requests...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-100">
                        {error}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
                        <p>No pending requests at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((req) => (
                            <div key={req.booking_id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{req.player_name || "Unknown Player"}</h3>
                                            <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {req.slot_date}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {req.start_time} - {req.end_time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Requested</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {new Date(req.booking_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border mb-6 flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                                    <div className="text-sm text-gray-600">
                                        <p className="font-semibold text-gray-500 mb-1">Reservation Request</p>
                                        <p className="italic">Player has requested a coaching session during their turf booking.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(req.booking_id, "declined")}
                                        className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 flex items-center justify-center gap-2 transition-all"
                                    >
                                        <XCircle className="w-5 h-5" /> Decline
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.booking_id, "accepted")}
                                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-100"
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