import client from './client';

export interface ReportStats {
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    pending_bookings: number;
    total_revenue: number;
}

export type ReportPeriod = 'weekly' | 'monthly' | 'annual';

export const reportAPI = {
    getDashboardStats: async (): Promise<ReportStats> => {
        const response = await client.get<ReportStats>('/api/admin/reports/stats');
        return response.data;
    },

    downloadReport: async (period: ReportPeriod): Promise<Blob> => {
        const response = await client.get(`/api/admin/reports/download`, {
            params: { type: period },
            responseType: 'blob', // Important for file downloads
        });
        return response.data;
    }
};

export default reportAPI;
