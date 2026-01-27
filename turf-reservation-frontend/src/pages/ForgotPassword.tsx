import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/api/auth";
import { ROUTES } from "@/constants";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Email is required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await forgotPassword(email);
            setSuccess(true);
            // Optionally redirect to reset-password with email pre-filled
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-emerald-600" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">OTP Sent!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{email}</span>.
                    </p>
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6">
                        Redirecting you to enter the code...
                    </div>
                    <button
                        onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Go to Reset Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4">
            <div className="w-full max-w-md">
                <button
                    onClick={() => navigate(ROUTES.LOGIN)}
                    className="flex items-center text-gray-600 hover:text-emerald-600 mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Login
                </button>

                <div className="bg-white rounded-3xl shadow-2xl p-10">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="text-emerald-600" size={32} />
                    </div>

                    <h2 className="text-3xl font-bold mb-2 text-gray-900">Forgot Password?</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Don't worry! It happens. Please enter the email associated with your account.
                    </p>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                            <div className="relative mt-2">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors"
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-200"
                        >
                            {isLoading ? "Sending code..." : "Send Verification Code"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
