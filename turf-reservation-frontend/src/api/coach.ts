import client from './client';
import type { ApiResponse } from '@/types';

export interface CoachProfile {
    user_id: number;
    specialization: string;
    availability: string;
    hourly_rate: number;
    certificate: string;
}

export interface CoachPublicProfile {
    user_id: number;
    name: string;
    email: string;
    specialization: string;
    availability: string; // "Mon,Wed,Fri|16:00-20:00"
    hourly_rate: number;
}

export interface UpdateCoachProfileData {
    specialization: string;
    availability: string;
    hourly_rate: number;
}

/**
 * Fetch the current coach's profile
 */
export async function getCoachProfile(): Promise<CoachProfile> {
    const response = await client.get<ApiResponse<CoachProfile>>('/api/coach/profile');
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch coach profile');
    }
    return response.data.data;
}

/**
 * Update the coach's availability settings
 */
export async function updateCoachProfile(data: UpdateCoachProfileData): Promise<void> {
    const response = await client.put<ApiResponse<void>>('/api/coach/profile', data);
    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update profile');
    }
}

/**
 * Get all available coaches (for players to browse)
 */
export async function getAllCoaches(): Promise<CoachPublicProfile[]> {
    const response = await client.get<ApiResponse<CoachPublicProfile[]>>('/api/coaches');
    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch coaches');
    }
    return response.data.data ?? [];
}

export interface CoachAdminProfile {
    user_id: number;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    availability: string;
    hourly_rate: number;
    certificate: string;
    last_login: string;
}

/**
 * Get all coaches with full details for admin management
 */
export async function getAdminCoaches(): Promise<CoachAdminProfile[]> {
    const response = await client.get<ApiResponse<CoachAdminProfile[]>>('/api/admin/coaches');
    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch admin coaches');
    }
    return response.data.data ?? [];
}

/**
 * Delete a coach's user account from the system (Admin only)
 */
export async function deleteCoach(userId: number): Promise<void> {
    const response = await client.delete<ApiResponse<void>>(`/api/admin/coaches/${userId}`);
    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete coach');
    }
}
