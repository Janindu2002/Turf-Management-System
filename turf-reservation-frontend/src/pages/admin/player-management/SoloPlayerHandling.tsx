import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    CheckSquare,
    Square,
    ArrowRight,
    Loader2
} from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";
import { playerAPI, type PlayerProfile } from "@/api/player";
import { teamAPI } from "@/api/team";

export default function SoloPlayerHandling() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [skillLevel, setSkillLevel] = useState("Intermediate");
    const [totalMembers, setTotalMembers] = useState(11);
    const [captainName, setCaptainName] = useState("");
    const [captainContact, setCaptainContact] = useState("");
    const [lookingPositions, setLookingPositions] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* =======================
       Effects
    ======================= */
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                const data = await playerAPI.getAdminSoloPlayers();
                setPlayers(data || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch solo players:", err);
                setError("Failed to load solo player pool. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    // Selection Logic
    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await teamAPI.createTeam({
                team_name: teamName,
                team_skill_level: skillLevel,
                turf_name: "Astro Turf Main", // Default or could be a field
                total_member: totalMembers,
                current_member: selectedIds.length,
                captain_name: captainName,
                captain_contact: captainContact,
                looking_positions: lookingPositions
            });
            
            alert(`Team "${teamName}" created successfully with ${selectedIds.length} players!`);
            setSelectedIds([]);
            setIsCreating(false);
            setTeamName("");
            setCaptainName("");
            setCaptainContact("");
            setLookingPositions("");
        } catch (err) {
            console.error("Failed to create team:", err);
            alert("Failed to create team. Please try again.");
        } finally {
            setLoading(false);
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
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Solo Player Pool</h2>
                    <p className="text-gray-600">Group individual players into teams for matches or leagues.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left: Player List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
                            <span className="font-bold text-gray-700">{selectedIds.length} Players Selected</span>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="text-sm text-red-600 hover:underline"
                            >
                                Clear Selection
                            </button>
                        </div>

                        {loading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
                                <p>Loading player pool...</p>
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                                {error}
                            </div>
                        ) : players.length > 0 ? (
                            players.map((player) => {
                                const isSelected = selectedIds.includes(player.user_id);
                                return (
                                    <div
                                        key={player.user_id}
                                        onClick={() => toggleSelection(player.user_id)}
                                        className={`
                                        p-4 rounded-xl border shadow-sm cursor-pointer transition-all flex items-center gap-4
                                        ${isSelected ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500" : "bg-white border-gray-200 hover:border-purple-300"}
                                    `}
                                    >
                                        <div className="text-purple-600">
                                            {isSelected ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6 text-gray-300" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-gray-900">{player.name}</h4>
                                                <div className="text-right text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                                                    {player.is_available ? "Available Now" : "Register Only"}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-gray-600 border border-gray-200">{player.position || "N/A"}</span>
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-gray-600 border border-gray-200">{player.skill_level || "N/A"}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-xs text-gray-400 font-medium">Days: {player.available_days || "Not specified"}</span>
                                            </div>
                                            {player.description && (
                                                <p className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                                                    "{player.description}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No solo players registered yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Action Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-24">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Create New Team</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Create a temporary team from the {selectedIds.length} selected solo players.
                            </p>

                            {isCreating ? (
                                <form onSubmit={handleCreateTeam} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Team Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            placeholder="e.g. Mixed Team A"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-1">Skill Level</label>
                                            <select
                                                value={skillLevel}
                                                onChange={(e) => setSkillLevel(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            >
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="Professional">Professional</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-1">Total Needed</label>
                                            <input
                                                type="number"
                                                required
                                                min={selectedIds.length}
                                                value={totalMembers}
                                                onChange={(e) => setTotalMembers(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Captain Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={captainName}
                                            onChange={(e) => setCaptainName(e.target.value)}
                                            placeholder="Full Name"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Captain Contact</label>
                                        <input
                                            type="text"
                                            required
                                            value={captainContact}
                                            onChange={(e) => setCaptainContact(e.target.value)}
                                            placeholder="Phone or Email"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">Looking For (Positions)</label>
                                        <textarea
                                            value={lookingPositions}
                                            onChange={(e) => setLookingPositions(e.target.value)}
                                            placeholder="e.g. Defender, Striker"
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="flex-1 py-2 border rounded-lg text-gray-600 font-semibold hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 shadow-sm"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    disabled={selectedIds.length === 0}
                                    className={`
                                        w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                                        ${selectedIds.length === 0
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:scale-105"}
                                    `}
                                >
                                    Create Team <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}