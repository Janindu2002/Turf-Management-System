import client from './client';
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse } from '@/types';

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<void> {
    const response = await client.post<ApiResponse<{ user: User }>>('/api/auth/register', data);
    if (!response.data.success) {
        throw new Error(response.data.error || 'Registration failed');
    }
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await client.post<ApiResponse<{ token: string; user: User }>>(
        '/api/auth/login',
        credentials
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Login failed');
    }

    return {
        token: response.data.data.token,
        user: response.data.data.user,
    };
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
    await client.post('/api/auth/logout');
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<User> {
    const response = await client.get<ApiResponse<{ user: User }>>('/api/auth/me');

    if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch user information');
    }

    return response.data.data.user;
}
