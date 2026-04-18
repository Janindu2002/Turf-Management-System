import client from "./client";

export interface Team {
    team_id?: number;
    team_name: string;
    team_skill_level: string;
    turf_name: string;
    total_member: number;
    current_member: number;
    captain_name: string;
    captain_contact: string;
    captain_email?: string;
    looking_positions: string;
    player_ids: number[];
}

export const teamAPI = {
    createTeam: async (teamData: Team) => {
        const response = await client.post("/api/admin/teams", teamData);
        return response.data.data;
    },

    getTeams: async () => {
        const response = await client.get("/api/teams");
        return response.data.data;
    },

    joinTeam: async (teamId: number) => {
        const response = await client.post<{ success: boolean; message: string }>(`/api/teams/${teamId}/join`);
        return response.data;
    },

    deleteTeam: async (id: number) => {
        const response = await client.delete(`/api/admin/teams/${id}`);
        return response.data;
    }
};
