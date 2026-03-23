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
    looking_positions: string;
}

export const teamAPI = {
    createTeam: async (teamData: Team) => {
        const response = await client.post("/api/admin/teams", teamData);
        return response.data.data;
    },

    getTeams: async () => {
        const response = await client.get("/api/teams");
        return response.data.data;
    }
};
