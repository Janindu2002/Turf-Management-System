import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Eye, UserPlus } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

interface Coach {
    id: number;
    name: string;
    specialization: string;
    experience: string;
    status: "Active" | "Suspended";
    rating: number;
}

const MOCK_COACHES: Coach[] = [
    { id: 1, name: "Lionel P.", specialization: "Tactical Training", experience: "5 Years", status: "Active", rating: 4.8 },
    { id: 2, name: "Sarah J.", specialization: "Fitness & Conditioning", experience: "3 Years", status: "Active", rating: 4.9 },
    { id: 3, name: "Ruwan K.", specialization: "Goalkeeping", experience: "8 Years", status: "Suspended", rating: 4.2 },
];

export default function CoachManagement() {
    const navigate = useNavigate();
    const [coaches, setCoaches] = useState<Coach[]>(MOCK_COACHES);

    const handleDelete = (id: number) => {
        if (confirm("Remove this coach?")) setCoaches(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50">
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Coach Management</h2>
                        <p className="text-gray-600">Verify certifications and manage coach profiles.</p>
                    </div>
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-purple-700">
                        <UserPlus className="w-4 h-4" /> Add Coach
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                            <tr>
                                <th className="p-4">Coach Name</th>
                                <th className="p-4">Specialization</th>
                                <th className="p-4">Experience</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {coaches.map((coach) => (
                                <tr key={coach.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-900">{coach.name}</td>
                                    <td className="p-4">{coach.specialization}</td>
                                    <td className="p-4">{coach.experience}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${coach.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {coach.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><Eye className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(coach.id)} className="p-2 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}