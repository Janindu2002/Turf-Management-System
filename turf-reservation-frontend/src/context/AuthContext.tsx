import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';
import * as authAPI from '../api/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<User>;
    register: (data: RegisterData | FormData, credentials?: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = user !== null;

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("[Auth] No token found, user is guest");
            setIsLoading(false);
            setUser(null);
            return;
        }

        try {
            console.log("[Auth] Token found, verifying session...");
            const userData = await authAPI.getCurrentUser();
            console.log("[Auth] Session verified:", userData.email);
            setUser(userData);
        } catch (error) {
            console.log("[Auth] Session verification failed");
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials): Promise<User> => {
        setIsLoading(true);
        try {
            const response: AuthResponse = await authAPI.login(credentials);
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            setUser(response.user);
            return response.user;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData | FormData, credentials?: LoginCredentials) => {
        setIsLoading(true);
        try {
            await authAPI.register(data);
            
            // After registration, automatically log in
            if (credentials) {
                await login(credentials);
            } else if (!(data instanceof FormData)) {
                await login({ email: data.email, password: data.password });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authAPI.logout();
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
