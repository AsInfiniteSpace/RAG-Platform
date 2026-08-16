import api from "@/lib/api";

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    tier: string;
    is_active: boolean;
    created_at: string;
}

export interface PlatformStats {
    total_users: number;
    total_documents: number;
    total_requests_today: number;
    avg_response_time_ms: number | null;
    total_tokens_today: number;
    total_search_units_today: number;
}

export interface UserUsage {
    email: string;
    tier: string;
    documents_by_type: Record<string, number>;

    storage_used_mb: number;
    storage_limit_mb: number;

    tokens_used_this_month: number;
    token_limit_this_month: number;

    search_units_used_this_month: number;
    search_unit_limit_this_month: number;
}


export async function getAdminUsers(): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>(
        "/admin/users"
    );

    return response.data;
}


export async function suspendUser(
    userId: string
) {
    const response = await api.patch(
        `/admin/users/${userId}/suspend`
    );

    return response.data;
}

export async function activateUser(userId: string) {
    const response = await api.patch(
        `/admin/users/${userId}/activate`
    );

    return response.data;
}

export async function getPlatformStats(): Promise<PlatformStats> {
    const response = await api.get<PlatformStats>(
        "/admin/stats"
    );

    return response.data;
}


export async function getUserUsage(
    userId: string
): Promise<UserUsage> {

    const response = await api.get<UserUsage>(
        `/admin/users/${userId}/usage`
    );

    return response.data;
}