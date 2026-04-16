import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Eye, Mail, Phone, BookOpen, Calendar, DollarSign, FileText, XCircle, Loader2, Users } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";
import { getAdminCoaches, deleteCoach } from "@/api/coach";
import type { CoachAdminProfile } from "@/api/coach";

export default function CoachManagement() {
    const navigate = useNavigate();
    const [coaches, setCoaches] = useState<CoachAdminProfile[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<CoachAdminProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                setLoading(true);
                const data = await getAdminCoaches();
                setCoaches(data);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch coaches:", err);
                setError(err.message || "Failed to load coaches.");
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    const handleDelete = async (userId: number) => {
        if (!confirm("Remove this coach from the system? This will delete their account permanently.")) return;
        
        try {
            await deleteCoach(userId);
            setCoaches(prev => prev.filter(c => c.user_id !== userId));
            alert("Coach deleted successfully.");
        } catch (err: any) {
            console.error("Failed to delete coach:", err);
            alert(err.message || "Failed to delete coach.");
        }
    };

    const formatRate = (rate: number) =>
        `Rs. ${rate.toLocaleString("en-LK")}`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Coach Profile Modal */}
            {selectedCoach && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-gray-900">Coach Profile</h2>
                            <button
                                onClick={() => setSelectedCoach(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                                    {selectedCoach.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedCoach.name}</h3>
                                    <p className="text-gray-500 text-sm">{selectedCoach.specialization || "Coach"}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{selectedCoach.email}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedCoach.phone || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                                    <DollarSign className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hourly Rate</p>
                                        <p className="text-sm font-bold text-purple-700">{formatRate(selectedCoach.hourly_rate)}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Availability</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">{selectedCoach.availability || "Not set"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialization</p>
                                    <p className="text-sm font-semibold text-gray-900">{selectedCoach.specialization || "Not specified"}</p>
                                </div>
                            </div>

                            {/* Certification Section */}
                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Professional Documentation</h4>
                                {selectedCoach.certificate ? (
                                    <a
                                        href={selectedCoach.certificate}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full p-4 bg-white border border-purple-200 rounded-xl flex items-center justify-between group hover:bg-purple-50 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 text-purple-700">
                                            <FileText className="w-6 h-6" />
                                            <span className="font-bold">Coach Certification File</span>
                                        </div>
                                        <span className="text-xs text-purple-500 font-bold bg-purple-100 px-3 py-1 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all">VIEW FILE</span>
                                    </a>
                                ) : (
                                    <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3 text-gray-400">
                                        <FileText className="w-6 h-6" />
                                        <span className="text-sm font-medium">No certification file uploaded.</span>
                                    </div>
                                )}
                            </div>

                            {/* Close Action */}
                            <button
                                onClick={() => setSelectedCoach(null)}
                                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                        <h1 className="text-xl font-bold">Astro Turf</h1>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">Admin</span>
                    </div>
                    <button onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)} className="text-gray-600 hover:text-purple-600 font-medium text-sm flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Coach Management</h2>
                    <p className="text-gray-600">Verify certifications and manage coach profiles.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center justify-center text-gray-500 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <p>Loading coaches...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500 bg-red-50">
                            <p className="font-semibold">{error}</p>
                        </div>
                    ) : (coaches || []).length === 0 ? (
                        <div className="p-16 flex flex-col items-center justify-center text-gray-400 gap-3">
                            <Users className="w-12 h-12 opacity-20" />
                            <p>No coaches registered yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                                <tr>
                                    <th className="p-4">Coach Name</th>
                                    <th className="p-4">Specialization</th>
                                    <th className="p-4">Hourly Rate</th>
                                    <th className="p-4">Last Login</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {coaches.map((coach) => (
                                    <tr key={coach.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{coach.name}</span>
                                                <span className="text-xs text-gray-500">{coach.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{coach.specialization || <span className="text-gray-400 italic">Not set</span>}</td>
                                        <td className="p-4 font-semibold text-purple-700">{formatRate(coach.hourly_rate)}</td>
                                        <td className="p-4 text-gray-500 text-xs">{coach.last_login}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedCoach(coach)}
                                                className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                                                title="View Profile"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coach.user_id)}
                                                className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
                                                title="Remove Coach"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}