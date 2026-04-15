import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Upload, X, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import { sendVerificationOTP, verifyOTP } from "@/api/auth";

/* =====================
   Types
===================== */
type Role = "player" | "coach";

type Errors = {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    form?: string;
};

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading, isAuthenticated, user } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const roleRoutes: Record<string, string> = {
                admin: ROUTES.ADMIN_DASHBOARD,
                coach: ROUTES.COACH_DASHBOARD,
                player: ROUTES.PLAYER_DASHBOARD,
            };
            navigate(roleRoutes[user.role] || ROUTES.HOME, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<Role>("player");
    const [hasTeam, setHasTeam] = useState(false);
    const [coachCertificate, setCoachCertificate] = useState<File | null>(null);
    const [errors, setErrors] = useState<Errors>({});

    // Email Verification States
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Details
    const [otp, setOtp] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    /* =====================
       Validation
    ===================== */
    const validate = () => {
        const e: Errors = {};
        if (!name) e.name = "Name is required";
        if (!email) e.email = "Email is required";
        if (!password || password.length < 8) {
            e.password = "Minimum 8 characters required";
        } else {
            const hasUpper = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            if (!hasUpper || !hasNumber || !hasSpecial) {
                e.password = "Must include uppercase, number, and special character";
            }
        }

        if (phone && !/^\d{10}$/.test(phone)) {
            e.phone = "Phone number must be exactly 10 digits";
        }

        if (role === "coach" && !coachCertificate) {
            e.form = "Coaching certificate is required";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* =====================
       Submit
    ===================== */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setErrors({});

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("phone", phone);
            formData.append("role", role);
            formData.append("otp", otp);

            if (role === "player") {
                formData.append("has_team", hasTeam.toString());
            } else if (role === "coach" && coachCertificate) {
                formData.append("certificate", coachCertificate);
            }

            await register(formData, { email, password });
        } catch (err: any) {
            setErrors({
                form: err.response?.data?.error || err.message || "Registration failed. Please try again.",
            });
        }
    };

    const handleSendOTP = async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }

        setIsActionLoading(true);
        setErrors({});
        setSuccessMessage("");

        try {
            await sendVerificationOTP(email);
            setStep(2);
            setSuccessMessage("Verification code has been sent to " + email);
        } catch (err: any) {
            setErrors({
                form: err.response?.data?.error || err.message || "Failed to send code",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setErrors({ form: "Please enter the 6-digit code" });
            return;
        }

        setIsActionLoading(true);
        setErrors({});

        try {
            await verifyOTP(email, otp);
            setStep(3);
            setSuccessMessage("Email verified! Let's complete your profile.");
        } catch (err: any) {
            setErrors({
                form: err.response?.data?.error || err.message || "Invalid code",
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file && file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, form: "File size should be less than 5MB" }));
            return;
        }
        setCoachCertificate(file);
        setErrors(prev => ({ ...prev, form: undefined }));
    };

    /* =====================
       UI
    ===================== */
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

                <h2 className="text-3xl font-bold text-center mb-2">Register</h2>
                <p className="text-gray-600 text-center mb-6 text-sm">
                    Create your account in 3 simple steps
                </p>

                {/* Progress Indicators */}
                <div className="flex justify-center mb-8 gap-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step === s ? "bg-emerald-600 w-16" : step > s ? "bg-emerald-200" : "bg-gray-100"
                                }`}
                        />
                    ))}
                </div>

                {errors.form && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                        {errors.form}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-xl text-sm">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-5">

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <div className="animate-in fade-in duration-300 space-y-5">
                            <div>
                                <label className="text-sm font-semibold">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={isActionLoading}
                                />
                                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={isActionLoading || !email}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
                            >
                                {isActionLoading ? "Sending Code..." : "Send Verification Code"}
                            </button>
                        </div>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <div className="animate-in fade-in duration-300 space-y-5">
                            <div>
                                <label className="text-sm font-semibold">Verification Code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-[0.5em] font-bold text-xl"
                                    disabled={isActionLoading}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleVerifyOTP}
                                    disabled={isActionLoading || otp.length !== 6}
                                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
                                >
                                    {isActionLoading ? "Verifying..." : "Verify Code"}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                className="w-full text-xs text-emerald-600 font-semibold hover:underline"
                            >
                                Resend Verification Code
                            </button>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {step === 3 && (
                        <div className="animate-in fade-in duration-300 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="text-sm font-semibold">Full Name</label>
                                <input
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={isLoading}
                                />
                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-sm font-semibold">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="10 digit number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={isLoading}
                                />
                                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm font-semibold">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="text-sm font-semibold">Register as</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as Role)}
                                    className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                    disabled={isLoading}
                                >
                                    <option value="player">Player</option>
                                    <option value="coach">Coach</option>
                                </select>
                            </div>

                            {/* Has Team (Conditional for Player) */}
                            {role === "player" && (
                                <div>
                                    <label className="text-sm font-semibold">Do you have a team?</label>
                                    <select
                                        value={hasTeam ? "yes" : "no"}
                                        onChange={(e) => setHasTeam(e.target.value === "yes")}
                                        className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                        disabled={isLoading}
                                    >
                                        <option value="no">Single Player</option>
                                        <option value="yes">I have a Team</option>
                                    </select>
                                </div>
                            )}

                            {/* Certificate (Conditional for Coach) */}
                            {role === "coach" && (
                                <div>
                                    <label className="text-sm font-semibold block mb-1">Coach Certificate</label>
                                    {!coachCertificate ? (
                                        <div
                                            onClick={() => document.getElementById("certificate-upload")?.click()}
                                            className="cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex flex-col items-center gap-2"
                                        >
                                            <Upload className="w-5 h-5 text-emerald-600" />
                                            <span className="text-xs font-semibold text-gray-500">Click to upload certificate</span>
                                            <input id="certificate-upload" type="file" hidden onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                            <FileText className="w-5 h-5 text-emerald-600" />
                                            <span className="flex-1 text-xs font-semibold truncate">{coachCertificate.name}</span>
                                            <button type="button" onClick={() => setCoachCertificate(null)} className="p-1 hover:bg-emerald-100 rounded-full text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold transition-colors shadow-sm mt-2"
                            >
                                {isLoading ? "Creating Account..." : "Complete Registration"}
                            </button>
                        </div>
                    )}
                </form>

                <p className="text-center text-gray-600 mt-6 pt-6 border-t border-gray-100">
                    Already have an account?{" "}
                    <button
                        onClick={() => navigate(ROUTES.LOGIN)}
                        className="text-emerald-600 font-semibold hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}
