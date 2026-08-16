import api from "@/lib/api";

export interface UserUsage {
    tier: string;

    documents_count: number;

    storage_used_mb: number;
    storage_limit_mb: number;

    tokens_used_this_month: number;
    token_limit_this_month: number;

    search_units_used_this_month: number;
    search_unit_limit_this_month: number;
}

export async function getMyUsage(): Promise<UserUsage> {
    const response = await api.get("/users/usage");

    return response.data;
}