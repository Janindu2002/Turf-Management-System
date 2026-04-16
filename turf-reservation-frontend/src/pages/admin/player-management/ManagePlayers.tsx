import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    Trash2,
    Eye,
    X,
    User,
    Phone,
    Mail,
    Activity,
    Trophy,
    Calendar,
    Clock
} from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";
import { playerAPI, type PlayerProfile } from "@/api/player";

// No mock data needed for production logic

export default function ManagePlayers() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            setIsLoading(true);
            const data = await playerAPI.getAllPlayers();
            setPlayers(data);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch players:", err);
            setError("Failed to load players. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic
    const filteredPlayers = (players || []).filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleDelete = async (userId: number) => {
        if (confirm("Are you sure you want to remove this player? This will also remove their bookings and hosted events.")) {
            try {
                await playerAPI.deletePlayer(userId);
                setPlayers(prev => prev.filter(p => p.user_id !== userId));
            } catch (err: any) {
                console.error("Failed to delete player:", err);
                alert("Failed to delete player. Technical details: " + (err.response?.data?.error || err.message));
            }
        }
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
                                    <th className="p-4">Has Team</th>
                                    <th className="p-4">Is Solo Player</th>
                                    <th className="p-4">Last Login Detail</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y relative min-h-[200px]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                                <p className="text-gray-500 font-medium">Loading player database...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <div className="text-red-500 font-medium flex flex-col items-center gap-2">
                                                <Activity className="w-8 h-8" />
                                                <span>{error}</span>
                                                <button onClick={fetchPlayers} className="mt-2 text-sm text-purple-600 hover:underline">Try Again</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPlayers.map((player) => (
                                    <tr key={player.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{player.name}</div>
                                            <div className="text-xs text-gray-500">{player.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold
                                                ${player.has_team ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}
                                            `}>
                                                {player.has_team ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold
                                                ${player.is_solo_player ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}
                                            `}>
                                                {player.is_solo_player ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-700 font-medium">{player.last_login}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedPlayer(player);
                                                        setIsModalOpen(true);
                                                    }}
                                                    title="View Profile" 
                                                    className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors border border-transparent hover:border-emerald-100"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(player.user_id)}
                                                    title="Delete User"
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors border border-transparent hover:border-red-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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

            {/* Profile Modal */}
            {isModalOpen && selectedPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                        
                        {/* Modal Header */}
                        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedPlayer.name}</h3>
                                    <p className="text-emerald-100 text-sm">Player ID: #{selectedPlayer.user_id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid md:grid-cols-2 gap-8">
                                
                                {/* Left Column: Info */}
                                <div className="space-y-6">
                                    {/* Personal Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" /> Contact Details
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border text-gray-400">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-sm">{selectedPlayer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border text-gray-400">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-sm">{selectedPlayer.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Player Stats */}
                                    {selectedPlayer.is_solo_player && (
                                        <div className="space-y-4 pt-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                                <Trophy className="w-3.5 h-3.5" /> Player Stats
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gray-50 p-3 rounded-xl border">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Position</p>
                                                    <p className="font-bold text-gray-900">{selectedPlayer.position}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl border">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Skill Level</p>
                                                    <p className="font-bold text-gray-900">{selectedPlayer.skill_level}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Status & Logistics */}
                                <div className="space-y-6">
                                    {/* System Status */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5" /> System Status
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                                                <span className="text-sm font-semibold text-emerald-800">Has Team</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedPlayer.has_team ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-600'}`}>{selectedPlayer.has_team ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 border border-blue-100">
                                                <span className="text-sm font-semibold text-blue-800">Solo Player</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedPlayer.is_solo_player ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-600'}`}>{selectedPlayer.is_solo_player ? 'Yes' : 'No'}</span>
                                            </div>
                                            {selectedPlayer.is_solo_player && (
                                                <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border border-gray-200">
                                                    <span className="text-sm font-semibold text-gray-700">Availability Status</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedPlayer.is_available ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>{selectedPlayer.is_available ? 'Online' : 'Offline'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Logistics */}
                                    {selectedPlayer.is_solo_player && (
                                        <div className="space-y-4 pt-4 border-t border-dashed">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" /> Availability
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(selectedPlayer.available_days || "").split(',').filter(Boolean).map(day => (
                                                    <span key={day} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold border border-gray-200">{day}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description/Notes */}
                            {selectedPlayer.is_solo_player && (
                                <div className="mt-8 pt-8 border-t space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" /> Additional Notes
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-xl border italic text-gray-600 text-sm leading-relaxed">
                                        "{selectedPlayer.description || "No additional notes provided by this player."}"
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 bg-gray-50 border-t flex justify-end">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}