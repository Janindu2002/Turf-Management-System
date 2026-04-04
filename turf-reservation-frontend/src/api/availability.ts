import client from './client';
import type { Timeslot } from '../types';

export const availabilityAPI = {
    getAvailability: async (date: string): Promise<Timeslot[]> => {
        const response = await client.get<Timeslot[]>(`/api/availability?date=${date}`);
        return response.data;
    },
    blockSlots: async (ids: number[], reason: string): Promise<{ success: boolean; message: string }> => {
        const response = await client.post<{ success: boolean; message: string }>('/api/admin/slots/block', { ids, reason });
        return response.data;
    },
    unblockSlot: async (id: number): Promise<{ success: boolean; message: string }> => {
        const response = await client.post<{ success: boolean; message: string }>(`/api/admin/slots/${id}/unblock`);
        return response.data;
    }
};

export default availabilityAPI;
