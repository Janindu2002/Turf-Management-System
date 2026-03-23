import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Upload, X, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";

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
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

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
            await register({
                name,
                email,
                phone,
                password,
                role,
                has_team: role === "player" ? hasTeam : undefined,
            });

            // AuthContext handles login after registration
            // Redirect based on role
            const roleRoutes: Record<Role, string> = {
                player: ROUTES.PLAYER_DASHBOARD,
                coach: ROUTES.COACH_DASHBOARD,
            };

            navigate(roleRoutes[role], { replace: true });
        } catch (err: any) {
            setErrors({
                form:
                    err.response?.data?.error ||
                    err.message ||
                    "Registration failed. Please try again.",
            });
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

                <h2 className="text-3xl font-bold text-center mb-2">
                    Create Account
                </h2>
                <p className="text-gray-600 text-center mb-6">
                    Join our Hockey turf reservation system
                </p>

                {errors.form && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                        {errors.form}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name */}
                    <div>
                        <input
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            disabled={isLoading}
                        />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone (optional) */}
                    <div>
                        <input
                            type="tel"
                            placeholder="Phone (optional 10 digits)"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                if (val.length <= 10) setPhone(val);
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            disabled={isLoading}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password (min 8 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="text-sm font-semibold block mb-2">
                            Register as
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            disabled={isLoading}
                        >
                            <option value="player">Player</option>
                            <option value="coach">Coach</option>
                        </select>
                    </div>

                    {/* Has Team Selection (Conditional for Player) */}
                    {role === "player" && (
                        <div>
                            <label className="text-sm font-semibold block mb-2">
                                Already have a team?
                            </label>
                            <select
                                value={hasTeam ? "yes" : "no"}
                                onChange={(e) => setHasTeam(e.target.value === "yes")}
                                className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                disabled={isLoading}
                            >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                    )}

                    {/* Coach Certificate Upload (Conditional for Coach) */}
                    {role === "coach" && (
                        <div>
                            <label className="text-sm font-semibold block mb-2">
                                Coaching Certificate / Qualification
                            </label>
                            {!coachCertificate ? (
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        const file = e.dataTransfer.files[0];
                                        if (file) handleFileChange(file);
                                    }}
                                    onClick={() => document.getElementById("certificate-upload")?.click()}
                                    className={`
                                        relative group cursor-pointer
                                        border-2 border-dashed rounded-2xl p-8
                                        flex flex-col items-center justify-center gap-3
                                        transition-all duration-300
                                        ${isDragging 
                                            ? "border-emerald-500 bg-emerald-50 scale-[0.99]" 
                                            : "border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/30"
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center
                                        transition-colors duration-300
                                        ${isDragging ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"}
                                    `}>
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-700">
                                            Click or drag file to upload
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PDF, PNG, JPG (max 5MB)
                                        </p>
                                    </div>
                                    <input
                                        id="certificate-upload"
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileChange(file);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-700 truncate">
                                            {coachCertificate.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(coachCertificate.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCoachCertificate(null)}
                                        className="p-2 hover:bg-emerald-200 rounded-full text-emerald-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition-colors"
                    >
                        {isLoading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
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
