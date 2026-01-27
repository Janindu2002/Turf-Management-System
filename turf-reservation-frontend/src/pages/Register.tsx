import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
