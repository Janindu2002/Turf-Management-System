import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Users,
    Trophy,
    ArrowLeft,
    Medal,
    MapPin,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";
import { teamAPI, type Team as BackendTeam } from "@/api/team";
import { useEffect } from "react";

// Mock data removed in favor of real API

/* =======================
   Component
======================= */
export default function FindTeam() {
    const navigate = useNavigate();
    useAuth();

    // State
    const [teams, setTeams] = useState<BackendTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [requestedTeams, setRequestedTeams] = useState<number[]>([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const data = await teamAPI.getTeams();
                setTeams(data || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch teams:", err);
                setError("Failed to load teams. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    // Filter Logic
    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.team_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Handle Join Request
    const handleJoinRequest = (teamId: number) => {
        // In a real app, API call goes here
        setRequestedTeams(prev => [...prev, teamId]);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Intro */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Find a Team</h1>
                    <p className="text-gray-600">Join an existing squad for the upcoming season or casual matches.</p>
                </div>

                {/* Search & Action Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800">Available Teams</h3>
                        <p className="text-xs text-gray-500">Filter by team name</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by team name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                {/* Team Grid */}
                {loading ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-600">Loading teams...</h3>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-xl border border-dashed border-red-200">
                        <h3 className="text-lg font-bold text-red-600">{error}</h3>
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-600">No teams found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => {
                            const isRequested = team.team_id ? requestedTeams.includes(team.team_id) : false;
                            const lookingFor = team.looking_positions 
                                ? team.looking_positions.split(',').map(s => s.trim()).filter(s => s !== "")
                                : [];

                            return (
                                <div key={team.team_id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    {/* Card Header Styled based on level */}
                                    <div className={`h-2 ${
                                        team.team_skill_level === 'Professional' ? 'bg-indigo-600' :
                                        team.team_skill_level === 'Advanced' ? 'bg-purple-600' :
                                        team.team_skill_level === 'Intermediate' ? 'bg-emerald-600' : 'bg-blue-500'
                                    }`}></div>

                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-700">
                                                        Hockey
                                                    </span>
                                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                                                        {team.team_skill_level}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">{team.team_name}</h3>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded-lg border">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{team.turf_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>{team.current_member} / {team.total_member} Members</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Medal className="w-4 h-4 text-gray-400" />
                                                <span>Captain: {team.captain_name}</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 mb-4">
                                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Looking For:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {lookingFor.length > 0 ? lookingFor.map(role => (
                                                    <span key={role} className="text-xs bg-white border px-2 py-1 rounded font-medium text-gray-700">
                                                        {role}
                                                    </span>
                                                )) : (
                                                    <span className="text-xs text-gray-400 italic">No specific roles listed</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer / Action */}
                                    <div className="p-4 border-t bg-gray-50">
                                        <button
                                            onClick={() => team.team_id && handleJoinRequest(team.team_id)}
                                            disabled={isRequested || (team.current_member >= team.total_member)}
                                            className={`
                                                w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                                                ${isRequested
                                                    ? "bg-green-100 text-green-700 cursor-default"
                                                    : team.current_member >= team.total_member
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-900 text-white hover:bg-gray-800"}
                                            `}
                                        >
                                            {isRequested ? (
                                                <><CheckCircle2 className="w-4 h-4" /> Request Sent</>
                                            ) : team.current_member >= team.total_member ? (
                                                "Team Full"
                                            ) : (
                                                "Request to Join"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}