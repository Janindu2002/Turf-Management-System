import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
    ArrowLeft, TrendingUp, Users, DollarSign, 
    CalendarCheck, Download, Loader2, FileSpreadsheet,
    Clock, CheckCircle, XCircle
} from "lucide-react";
import { ROUTES } from "@/constants";
import logo from "@/assets/logo.jpeg";
import { reportAPI, type ReportStats, type ReportPeriod } from "@/api/report";

export default function ReportsAnalytics() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<ReportPeriod | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await reportAPI.getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch statistics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleDownload = async (period: ReportPeriod) => {
        try {
            setDownloading(period);
            const blob = await reportAPI.downloadReport(period);
            
            // Create a link and trigger download
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `turf_report_${period}_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to download report. Please try again.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">Admin</span>
                    </div>
                    <button 
                        onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)} 
                        className="text-gray-600 hover:text-purple-600 flex items-center gap-2 font-medium text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
                        <p className="text-gray-500 font-normal">Performance summary for the last 30 days.</p>
                    </div>
                    <div className="bg-purple-100 px-4 py-2 rounded-xl border border-purple-200">
                        <span className="text-purple-700 text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Real-time Data Sync
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                        <p className="text-gray-500 font-medium italic">Crunching latest numbers...</p>
                    </div>
                ) : (
                    <>
                        {/* Stat Highlights */}
                        <div className="grid md:grid-cols-4 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-green-100 p-3 rounded-xl text-green-600"><DollarSign className="w-6 h-6" /></div>
                                    <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Revenue</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">LKR {stats?.total_revenue.toLocaleString() || "0"}</h3>
                                <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Validated Billings
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Users className="w-6 h-6" /></div>
                                    <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Confirmed</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">{stats?.confirmed_bookings || "0"}</h3>
                                <p className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Successful slots
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><CalendarCheck className="w-6 h-6" /></div>
                                    <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">{stats?.total_bookings || "0"}</h3>
                                <p className="text-xs text-gray-400 font-medium mt-2">Total requests handled</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Clock className="w-6 h-6" /></div>
                                    <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Pending</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">{stats?.pending_bookings || "0"}</h3>
                                <p className="text-xs text-orange-600 font-medium mt-2">Awaiting action</p>
                            </div>
                        </div>

                        {/* Report Generation Center */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-gray-200">
                            <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Downloadable Reports</h3>
                                    <p className="text-gray-500 text-sm font-normal">Export detailed reservation data to CSV format.</p>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg text-purple-700 text-xs font-semibold uppercase">
                                    <FileSpreadsheet className="w-4 h-4" /> CSV Format
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                {/* Weekly Report */}
                                <div className="p-8 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                            <CalendarCheck className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-purple-600 tracking-widest">Last 7 Days</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Weekly Summary</h4>
                                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">Detailed breakdown of bookings and revenue from the previous 7 days of operation.</p>
                                    <button 
                                        disabled={!!downloading}
                                        onClick={() => handleDownload('weekly')}
                                        className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-semibold py-3 rounded-xl transition-all border border-purple-100 hover:border-purple-600 disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-md"
                                    >
                                        {downloading === 'weekly' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                        Generate Report
                                    </button>
                                </div>

                                {/* Monthly Report */}
                                <div className="p-8 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-purple-600 tracking-widest">Last 30 Days</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Monthly Performance</h4>
                                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">Strategic overview of usage patterns, popular slots, and gross revenue for the month.</p>
                                    <button 
                                        disabled={!!downloading}
                                        onClick={() => handleDownload('monthly')}
                                        className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-semibold py-3 rounded-xl transition-all border border-purple-100 hover:border-purple-600 disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-md"
                                    >
                                        {downloading === 'monthly' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                        Generate Report
                                    </button>
                                </div>

                                {/* Annual Report */}
                                <div className="p-8 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                            <FileSpreadsheet className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-purple-600 tracking-widest">Full Year</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Annual Audit</h4>
                                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">Comprehensive annual data set including tax-ready revenue summaries and major trends.</p>
                                    <button 
                                        disabled={!!downloading}
                                        onClick={() => handleDownload('annual')}
                                        className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-semibold py-3 rounded-xl transition-all border border-purple-100 hover:border-purple-600 disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-md"
                                    >
                                        {downloading === 'annual' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Future Analytics Placeholder */}
                        <div className="grid lg:grid-cols-2 gap-6 mt-10">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 ring-1 ring-gray-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <h3 className="font-semibold text-gray-900">Success Rate</h3>
                                </div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {stats?.total_bookings ? Math.round((stats.confirmed_bookings / stats.total_bookings) * 100) : 0}%
                                    </span>
                                    <span className="text-gray-400 font-semibold mb-1">Conversion</span>
                                </div>
                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-green-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${stats?.total_bookings ? (stats.confirmed_bookings / stats.total_bookings) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 ring-1 ring-gray-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    <h3 className="font-semibold text-gray-900">Cancellation Impact</h3>
                                </div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-bold text-gray-900">{stats?.cancelled_bookings || "0"}</span>
                                    <span className="text-gray-400 font-semibold mb-1">Dropped Slots</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Revenue potential of lost slots: <span className="text-red-600 font-semibold">LKR --</span></p>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}