import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
}

/**
 * ProtectedRoute component guards routes that require authentication
 * and optionally checks for specific user roles
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on actual role
        const roleRoutes: Record<string, string> = {
            admin: ROUTES.ADMIN_DASHBOARD,
            coach: ROUTES.COACH_DASHBOARD,
            player: ROUTES.PLAYER_DASHBOARD,
        };

        const redirectTo = user ? roleRoutes[user.role] || ROUTES.HOME : ROUTES.HOME;
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
