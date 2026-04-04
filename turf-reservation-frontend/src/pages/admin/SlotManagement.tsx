import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    Ban, 
    Calendar, 
    Clock, 
    Unlock, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    X,
    Info
} from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";
import { availabilityAPI } from "@/api/availability";
import type { Timeslot } from "@/types";

export default function SlotManagement() {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<Timeslot[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [blockReason, setBlockReason] = useState("");

    // Fetch Slots on date change
    const fetchSlots = async (selectedDate: string) => {
        if (!selectedDate) return;
        try {
            setLoading(true);
            setError(null);
            const data = await availabilityAPI.getAvailability(selectedDate);
            setSlots(data || []);
            setSelectedIds([]); // Reset selection on date change
        } catch (err) {
            console.error("Failed to fetch slots:", err);
            setError("Failed to load availability for this date.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots(date);
    }, [date]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    };

    const toggleSelect = (id: number, status: string) => {
        if (status === 'booked') return; // Cannot select booked slots
        
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id) 
                : [...prev, id]
        );
    };

    const handleBlockSlots = async () => {
        if (selectedIds.length === 0 || !blockReason.trim()) return;

        try {
            setActionLoading(true);
            const result = await availabilityAPI.blockSlots(selectedIds, blockReason);
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setBlockReason("");
                setSelectedIds([]);
                fetchSlots(date); // Refresh
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || "Failed to block slots. Please try again.";
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            setActionLoading(true);
            const result = await availabilityAPI.unblockSlot(id);
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                fetchSlots(date);
            }
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to unblock slot." });
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (time24: string) => {
        if (!time24) return "";
        const [h, m] = time24.split(":");
        const hour = Number(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                        <h1 className="text-xl font-bold hidden sm:block">Astro Turf</h1>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-bold">Admin</span>
                    </div>
                    <button 
                        onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)} 
                        className="text-gray-600 hover:text-purple-600 flex items-center gap-2 font-bold text-sm transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Slot Controls</h2>
                        <p className="text-gray-500 mt-1 font-medium">Manage on-field availability for maintenance or events.</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Calendar className="text-purple-600 w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-purple-600 tracking-widest leading-none mb-1">Select Date</span>
                            <input
                                type="date"
                                value={date}
                                onChange={handleDateChange}
                                className="border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 outline-none cursor-pointer bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-bold">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage(null)}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                    </div>
                )}

                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-400 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                        <p className="font-bold tracking-wide">Retrieving Turf Schedule...</p>
                    </div>
                ) : error ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-red-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-6">{error}</p>
                        <button onClick={() => fetchSlots(date)} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Try Again</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {slots.length > 0 ? (
                            slots.map((slot) => (
                                <div 
                                    key={slot.time_slot_id} 
                                    onClick={() => slot.status !== 'booked' && toggleSelect(slot.time_slot_id, slot.status)}
                                    className={`
                                        group relative p-3 rounded-xl border transition-all cursor-pointer overflow-hidden
                                        ${slot.status === 'booked' ? 'bg-gray-100 border-gray-100 opacity-60 cursor-not-allowed' : 
                                          slot.status === 'blocked' ? 'bg-red-50 border-red-200' : 
                                          selectedIds.includes(slot.time_slot_id) ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-100' :
                                          'bg-white border-gray-100 hover:border-purple-200 hover:shadow-sm'}
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-1.5 rounded-md ${slot.status === 'booked' ? 'bg-gray-200 text-gray-400' : slot.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                                            <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded-full ${
                                            slot.status === 'booked' ? 'bg-gray-200 text-gray-500' : 
                                            slot.status === 'blocked' ? 'bg-red-200 text-red-700' : 
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {slot.status}
                                        </span>
                                    </div>
                                    
                                    <h4 className="text-sm font-bold text-gray-900 leading-none">{formatTime(slot.start_time)}</h4>
                                    <p className="text-gray-400 text-[10px] font-bold mt-1 mb-2">{formatTime(slot.end_time)}</p>

                                    {slot.status === 'blocked' && (
                                        <div className="flex flex-col gap-1.5 mt-1">
                                            <div className="flex items-start gap-1.5 text-red-700 bg-red-100/50 p-1.5 rounded-lg">
                                                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                                <p className="text-[9px] font-bold leading-tight uppercase line-clamp-2">Blocked: {slot.blocked_reason}</p>
                                            </div>
                                            <button 
                                                disabled={actionLoading}
                                                onClick={(e) => { e.stopPropagation(); handleUnblock(slot.time_slot_id); }}
                                                className="w-full bg-white border border-red-200 text-red-600 py-1 rounded-lg text-[9px] font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Unlock className="w-2.5 h-2.5" /> Unblock
                                            </button>
                                        </div>
                                    )}

                                    {slot.status === 'available' && !selectedIds.includes(slot.time_slot_id) && (
                                        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-4 h-4 rounded-full border border-purple-200"></div>
                                        </div>
                                    )}

                                    {selectedIds.includes(slot.time_slot_id) && (
                                        <div className="absolute right-3 bottom-3">
                                            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-bold">No slots generated for this date.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Selection Panel */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-30">
                    <div className="bg-white text-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="shrink-0 text-center md:text-left border-r border-gray-100 pr-6 hidden md:block">
                                <span className="text-4xl font-bold text-purple-600">{selectedIds.length}</span>
                                <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400">Slots Selected</p>
                            </div>

                            <div className="flex-1 w-full space-y-2">
                                <div className="relative">
                                    <Ban className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Reason for blocking (e.g. Grass Maintenance)..."
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setSelectedIds([])}
                                    className="px-4 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={!blockReason.trim() || actionLoading}
                                    onClick={handleBlockSlots}
                                    className={`
                                        px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md
                                        ${!blockReason.trim() || actionLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95 shadow-purple-200'}
                                    `}
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                    Block Selected
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}