import client from "./client";

export interface PlayerProfile {
    user_id: number;
    name: string;
    email: string;
    phone?: string;
    skill_level?: string;
    position?: string;
    available_days?: string;
    description?: string;
    is_solo_player: boolean;
    is_available: boolean;
    has_team: boolean;
    last_login?: string;
}

export const playerAPI = {
    getMyProfile: async (): Promise<PlayerProfile> => {
        const response = await client.get<{ success: boolean; data: PlayerProfile }>("/api/players/me");
        return response.data.data;
    },
    updateProfile: async (profile: Partial<PlayerProfile>): Promise<void> => {
        await client.put("/api/players/profile", profile);
    },
    toggleAvailability: async (isAvailable: boolean): Promise<void> => {
        await client.put("/api/players/availability", { is_available: isAvailable });
    },
    getAdminSoloPlayers: async (): Promise<PlayerProfile[]> => {
        const response = await client.get<{ success: boolean; data: PlayerProfile[] }>("/api/admin/players/solo");
        return response.data.data;
    },
    getAllPlayers: async (): Promise<PlayerProfile[]> => {
        const response = await client.get<{ success: boolean; data: PlayerProfile[] }>("/api/admin/players");
        return response.data.data;
    },
    deletePlayer: async (userId: number): Promise<void> => {
        await client.delete(`/api/admin/players/${userId}`);
    }
};

