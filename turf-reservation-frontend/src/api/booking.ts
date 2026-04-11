import client from './client';

export interface BookingData {
    time_slot_id: number;
    total_price: number;
    coach_id?: number | null;
    event_id?: number | null;
}

export interface BookingResponse {
    booking_id: number;
    user_id: number;
    time_slot_id: number;
    coach_id?: number | null;
    event_id?: number | null;
    booking_date: string;
    status: 'confirmed' | 'cancelled' | 'pending';
    coach_approval_status: 'none' | 'pending' | 'approved' | 'rejected';
    admin_approval_status: 'none' | 'pending' | 'approved' | 'rejected';
    total_price: number;
    payment_status: 'pending' | 'paid';
    slot_date?: string;
    start_time?: string;
    end_time?: string;
    player_name?: string;
    player_email?: string;
    coach_name?: string;
    turf_name?: string;
}

export const bookingAPI = {
    createBooking: async (data: BookingData): Promise<BookingResponse> => {
        const response = await client.post<BookingResponse>('/api/bookings', data);
        return response.data;
    },

    getMyBookings: async (): Promise<BookingResponse[]> => {
        const response = await client.get<BookingResponse[]>('/api/bookings/my');
        return response.data;
    },

    rescheduleBooking: async (id: number, newTimeSlotID: number): Promise<{ message: string }> => {
        const response = await client.put<{ message: string }>(`/api/bookings/${id}/reschedule`, {
            new_time_slot_id: newTimeSlotID
        });
        return response.data;
    },

    cancelBooking: async (id: number): Promise<{ message: string }> => {
        const response = await client.post<{ message: string }>(`/api/bookings/${id}/cancel`, {});
        return response.data;
    },

    // Admin methods
    getPendingBookings: async (): Promise<BookingResponse[]> => {
        const response = await client.get<BookingResponse[]>('/api/admin/bookings/pending');
        return response.data;
    },

    approveBooking: async (id: number): Promise<{ message: string }> => {
        const response = await client.post<{ message: string }>(`/api/admin/bookings/${id}/approve`, {});
        return response.data;
    },

    rejectBooking: async (id: number): Promise<{ message: string }> => {
        const response = await client.post<{ message: string }>(`/api/admin/bookings/${id}/reject`, {});
        return response.data;
    },

    deleteBooking: async (id: number): Promise<{ message: string }> => {
        const response = await client.delete<{ message: string }>(`/api/bookings/${id}`);
        return response.data;
    },

    // Coach methods
    getCoachRequests: async (): Promise<BookingResponse[]> => {
        const response = await client.get<BookingResponse[]>('/api/coach/bookings');
        return response.data;
    },

    coachApproveBooking: async (id: number): Promise<{ message: string }> => {
        const response = await client.post<{ message: string }>(`/api/coach/bookings/${id}/approve`, {});
        return response.data;
    },

    coachRejectBooking: async (id: number): Promise<{ message: string }> => {
        const response = await client.post<{ message: string }>(`/api/coach/bookings/${id}/reject`, {});
        return response.data;
    }
};

export default bookingAPI;
