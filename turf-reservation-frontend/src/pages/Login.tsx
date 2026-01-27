import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";

/* =====================
   Types
===================== */
type Errors = {
    email?: string;
    password?: string;
    form?: string;
};

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    /* =====================
       Validation
    ===================== */
    const validate = () => {
        const e: Errors = {};
        if (!email) e.email = "Email is required";
        if (!password) e.password = "Password is required";
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
            const loggedInUser = await login({ email, password });

            // Redirect to appropriate dashboard based on user role
            const roleRoutes: Record<string, string> = {
                admin: ROUTES.ADMIN_DASHBOARD,
                coach: ROUTES.COACH_DASHBOARD,
                player: ROUTES.PLAYER_DASHBOARD,
            };
            navigate(roleRoutes[loggedInUser.role] || ROUTES.HOME, { replace: true });
        } catch (err: any) {
            setErrors({
                form:
                    err.response?.data?.error ||
                    err.message ||
                    "Login failed. Please try again.",
            });
        }
    };

    /* =====================
       UI
    ===================== */
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

                <h2 className="text-3xl font-bold text-center mb-2">Login</h2>
                <p className="text-gray-600 text-center mb-6">
                    Enter your credentials to continue
                </p>

                {errors.form && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                        {errors.form}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="text-sm font-semibold">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="you@example.com"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-semibold">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                                placeholder="••••••••"
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition-colors"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <button
                        onClick={() => navigate(ROUTES.REGISTER)}
                        className="text-emerald-600 font-semibold hover:underline"
                    >
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
}
