import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Users,
    Trophy,
    ArrowLeft,
    Medal,
    MapPin,
    CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

/* =======================
   Types
======================= */
type SportType = "Hockey";

interface Team {
    id: number;
    name: string;
    sport: SportType;
    level: string;
    members_count: number;
    max_members: number;
    location: string;
    looking_for: string[]; // e.g. ["Goalie", "Defender"]
    captain: string;
}

/* =======================
   Mock Data
======================= */
const MOCK_TEAMS: Team[] = [
    {
        id: 1,
        name: "Colombo Strikers",
        sport: "Hockey",
        level: "Advanced",
        members_count: 8,
        max_members: 11,
        location: "Turf A",
        looking_for: ["Goalkeeper", "Striker"],
        captain: "Kamal Perera"
    },
    {
        id: 2,
        name: "Stick Wizards",
        sport: "Hockey",
        level: "Intermediate",
        members_count: 5,
        max_members: 7,
        location: "Turf B",
        looking_for: ["Defender"],
        captain: "Sarah Jenkins"
    },
    {
        id: 3,
        name: "Midnight Runners",
        sport: "Hockey",
        level: "Casual",
        members_count: 4,
        max_members: 5,
        location: "Turf A",
        looking_for: ["Any"],
        captain: "Rajeev D."
    },
    {
        id: 4,
        name: "Puck Masters",
        sport: "Hockey",
        level: "Pro",
        members_count: 6,
        max_members: 7,
        location: "Turf B",
        looking_for: ["Midfielder", "Forward"],
        captain: "Dilshan M."
    },
    {
        id: 5,
        name: "Goal Diggers",
        sport: "Hockey",
        level: "Beginner",
        members_count: 3,
        max_members: 5,
        location: "Turf A",
        looking_for: ["Any"],
        captain: "Nimali S."
    }
];

/* =======================
   Component
======================= */
export default function FindTeam() {
    const navigate = useNavigate();
    useAuth();

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [sportFilter] = useState<"All" | SportType>("All"); // Kept for logic extensibility
    const [requestedTeams, setRequestedTeams] = useState<number[]>([]);

    // Filter Logic
    const filteredTeams = MOCK_TEAMS.filter(team => {
        const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSport = sportFilter === "All" || team.sport === sportFilter;
        return matchesSearch && matchesSport;
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
                {filteredTeams.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-600">No teams found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => {
                            const isRequested = requestedTeams.includes(team.id);

                            return (
                                <div key={team.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    {/* Card Header */}
                                    <div className="h-2 bg-blue-500"></div>

                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-700">
                                                        {team.sport}
                                                    </span>
                                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                                                        {team.level}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded-lg border">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{team.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>{team.members_count} / {team.max_members} Members</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Medal className="w-4 h-4 text-gray-400" />
                                                <span>Captain: {team.captain}</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 mb-4">
                                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Looking For:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {team.looking_for.map(role => (
                                                    <span key={role} className="text-xs bg-white border px-2 py-1 rounded font-medium text-gray-700">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer / Action */}
                                    <div className="p-4 border-t bg-gray-50">
                                        <button
                                            onClick={() => handleJoinRequest(team.id)}
                                            disabled={isRequested}
                                            className={`
                                                w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                                                ${isRequested
                                                    ? "bg-green-100 text-green-700 cursor-default"
                                                    : "bg-gray-900 text-white hover:bg-gray-800"}
                                            `}
                                        >
                                            {isRequested ? (
                                                <><CheckCircle2 className="w-4 h-4" /> Request Sent</>
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