import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ban, Calendar, Clock, Unlock } from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";

export default function SlotManagement() {
    const navigate = useNavigate();
    const [date, setDate] = useState("");

    // Mock Slots
    const [slots, setSlots] = useState([
        { id: 1, time: "08:00 - 09:00", status: "Available" },
        { id: 2, time: "09:00 - 10:00", status: "Booked" },
        { id: 3, time: "10:00 - 11:00", status: "Maintenance" },
        { id: 4, time: "11:00 - 12:00", status: "Available" },
    ]);

    const toggleBlock = (id: number) => {
        setSlots(prev => prev.map(slot => {
            if (slot.id === id) {
                return { ...slot, status: slot.status === "Maintenance" ? "Available" : "Maintenance" };
            }
            return slot;
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">Admin</span>
                    </div>
                    <button onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)} className="text-gray-600 hover:text-purple-600 flex items-center gap-2 font-medium text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Slot Controls</h2>
                    <p className="text-gray-600">Block slots for maintenance or special events.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 flex items-center gap-4">
                    <Calendar className="text-purple-600 w-5 h-5" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-500">Select a date to manage availability.</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {slots.map((slot) => (
                        <div key={slot.id} className={`p-4 rounded-xl border flex items-center justify-between ${slot.status === 'Maintenance' ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-bold text-gray-800">{slot.time}</span>
                            </div>

                            {slot.status === 'Booked' ? (
                                <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">Booked</span>
                            ) : (
                                <button
                                    onClick={() => toggleBlock(slot.id)}
                                    className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                                        ${slot.status === 'Maintenance'
                                            ? 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                                            : 'bg-red-100 text-red-600 hover:bg-red-200'}
                                    `}
                                >
                                    {slot.status === 'Maintenance' ? <><Unlock className="w-3 h-3" /> Unblock</> : <><Ban className="w-3 h-3" /> Block</>}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}