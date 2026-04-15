import client from './client';
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse } from '@/types';

/**
 * Register a new user
 */
export async function register(data: RegisterData | FormData): Promise<void> {
    const isFormData = data instanceof FormData;
    const response = await client.post<ApiResponse<{ user: User }>>(
        '/api/auth/register',
        data,
        isFormData
            ? { headers: { 'Content-Type': undefined } } // Let axios set multipart boundary automatically
            : undefined
    );
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
/**
 * Request a password reset link
 */
export async function forgotPassword(email: string): Promise<void> {
    const response = await client.post<ApiResponse<void>>('/api/auth/forgot-password', { email });
    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to request reset link');
    }
}

/**
 * Reset password using a token
 */
export async function resetPassword(email: string, otp: string, password: string): Promise<void> {
    const response = await client.post<ApiResponse<void>>('/api/auth/reset-password', { email, otp, password });
    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to reset password');
    }
}

/**
 * Send a verification OTP for registration
 */
export async function sendVerificationOTP(email: string): Promise<void> {
    const response = await client.post<ApiResponse<void>>('/api/auth/send-verification-otp', { email });
    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to send verification code');
    }
}

/**
 * Verify registration OTP
 */
export async function verifyOTP(email: string, otp: string): Promise<void> {
    const response = await client.post<ApiResponse<void>>('/api/auth/verify-otp', { email, otp });
    if (!response.data.success) {
        throw new Error(response.data.error || 'Invalid verification code');
    }
}
