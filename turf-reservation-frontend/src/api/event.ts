import client from "@/api/client";

export interface EventResponse {
    event_id: number;
    user_id?: number;
    event_name: string;
    event_type: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    expected_participants?: number;
    description?: string;
    requirements?: string;
    status: string;
    created_at: string;
    player_name?: string;
    player_email?: string;
}

export interface HostEventRequest {
    eventName: string;
    eventType: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    expectedParticipants?: number;
    description?: string;
    requirements?: string;
}

export const eventAPI = {
    hostEvent: async (data: HostEventRequest): Promise<EventResponse> => {
        const response = await client.post<EventResponse>("/api/events/host", data);
        return response.data;
    },

    getMyEvents: async (): Promise<EventResponse[]> => {
        const response = await client.get<EventResponse[]>("/api/events/my");
        return response.data;
    },

    getPendingEvents: async (): Promise<EventResponse[]> => {
        const response = await client.get<EventResponse[]>("/api/admin/events/pending");
        return response.data;
    },

    approveEvent: async (id: number): Promise<{ message: string }> => {
        const response = await client.post<{ message: string }>(`/api/admin/events/${id}/approve`, {});
        return response.data;
    },

    rejectEvent: async (id: number): Promise<{ message: string }> => {
        const response = await client.post<{ message: string }>(`/api/admin/events/${id}/reject`, {});
        return response.data;
    },

    cancelEvent: async (id: number): Promise<{ message: string }> => {
        const response = await client.post<{ message: string }>(`/api/admin/events/${id}/cancel`, {});
        return response.data;
    },

    getAllEvents: async (): Promise<EventResponse[]> => {
        const response = await client.get<EventResponse[]>("/api/admin/events");
        return response.data;
    },

    deleteEvent: async (id: number): Promise<void> => {
        await client.delete(`/api/events/${id}`);
    },
};
