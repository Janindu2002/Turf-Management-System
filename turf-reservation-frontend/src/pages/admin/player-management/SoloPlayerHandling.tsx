import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    CheckSquare,
    Square,
    ArrowRight
} from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

/* =======================
   Mock Data
======================= */
interface SoloPlayer {
    id: number;
    name: string;
    position: string;
    skill: string;
    available_days: string[];
}

const SOLO_POOL: SoloPlayer[] = [
    { id: 101, name: "David M.", position: "Striker", skill: "Advanced", available_days: ["Mon", "Wed"] },
    { id: 102, name: "Suresh P.", position: "Goalkeeper", skill: "Intermediate", available_days: ["Mon", "Fri"] },
    { id: 103, name: "Fazil A.", position: "Defender", skill: "Advanced", available_days: ["Mon", "Tue"] },
    { id: 104, name: "John D.", position: "Midfielder", skill: "Beginner", available_days: ["Sat", "Sun"] },
    { id: 105, name: "Malith K.", position: "Striker", skill: "Intermediate", available_days: ["Mon", "Wed"] },
];

export default function SoloPlayerHandling() {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [teamName, setTeamName] = useState("");

    // Selection Logic
    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleCreateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Team "${teamName}" created with ${selectedIds.length} players!`);
        // API Call would happen here
        setSelectedIds([]);
        setIsCreating(false);
        setTeamName("");
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

                        {SOLO_POOL.map((player) => {
                            const isSelected = selectedIds.includes(player.id);
                            return (
                                <div
                                    key={player.id}
                                    onClick={() => toggleSelection(player.id)}
                                    className={`
                                        p-4 rounded-xl border shadow-sm cursor-pointer transition-all flex items-center gap-4
                                        ${isSelected ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500" : "bg-white border-gray-200 hover:border-purple-300"}
                                    `}
                                >
                                    <div className="text-purple-600">
                                        {isSelected ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6 text-gray-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{player.name}</h4>
                                        <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-semibold">{player.position}</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-semibold">{player.skill}</span>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-400">
                                        Avail: {player.available_days.join(", ")}
                                    </div>
                                </div>
                            )
                        })}
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