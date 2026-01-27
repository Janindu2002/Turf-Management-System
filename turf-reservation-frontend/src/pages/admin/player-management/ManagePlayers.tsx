import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    Trash2,
    Eye,
    UserPlus,
    ShieldBan
} from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

/* =======================
   Mock Data & Types
======================= */
interface Player {
    id: number;
    name: string;
    email: string;
    role: "Player" | "Captain";
    status: "Active" | "Banned";
    joined: string;
}

const MOCK_PLAYERS: Player[] = [
    { id: 1, name: "Kamal Perera", email: "kamal@gmail.com", role: "Captain", status: "Active", joined: "2023-01-15" },
    { id: 2, name: "Nimali Silva", email: "nimali@yahoo.com", role: "Player", status: "Active", joined: "2023-02-10" },
    { id: 3, name: "Saman Kumara", email: "saman@outlook.com", role: "Player", status: "Banned", joined: "2023-03-05" },
    { id: 4, name: "Rajeev D.", email: "rajeev@gmail.com", role: "Player", status: "Active", joined: "2023-05-20" },
];

export default function ManagePlayers() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter Logic
    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to remove this player?")) {
            setPlayers(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleBan = (id: number) => {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, status: "Banned" } : p));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                        <h1 className="text-xl font-bold">Astro Turf</h1>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">Admin</span>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
                        className="text-gray-600 hover:text-purple-600 font-medium text-sm flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Page Title & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Player Management</h2>
                        <p className="text-gray-600">Manage registered users and captains.</p>
                    </div>
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-purple-700">
                        <UserPlus className="w-4 h-4" /> Add Player
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Joined Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{player.name}</div>
                                            <div className="text-xs text-gray-500">{player.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${player.role === 'Captain' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}
                                            `}>
                                                {player.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${player.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                            `}>
                                                {player.status}
                                            </span>
                                        </td>
                                        <td className="p-4">{player.joined}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button title="View Profile" className="p-2 hover:bg-gray-100 rounded text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {player.status !== "Banned" && (
                                                    <button
                                                        onClick={() => handleBan(player.id)}
                                                        title="Ban User"
                                                        className="p-2 hover:bg-orange-50 rounded text-orange-600"
                                                    >
                                                        <ShieldBan className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(player.id)}
                                                    title="Delete User"
                                                    className="p-2 hover:bg-red-50 rounded text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredPlayers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No players found matching your search.
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}