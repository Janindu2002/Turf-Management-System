import client from './client';
import type { Timeslot } from '../types';

export const availabilityAPI = {
    getAvailability: async (date: string): Promise<Timeslot[]> => {
        const response = await client.get<Timeslot[]>(`/api/availability?date=${date}`);
        return response.data;
    }
};

export default availabilityAPI;
