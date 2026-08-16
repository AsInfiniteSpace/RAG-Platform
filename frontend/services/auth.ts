import api from "@/lib/api";

import {
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
} from "@/types/auth";

export async function register(
    data: RegisterRequest
): Promise<UserResponse> {

    const response = await api.post<UserResponse>(
        "/auth/register",
        data
    );

    return response.data;
}

export async function login(
    data: LoginRequest
): Promise<UserResponse> {

    const response = await api.post<UserResponse>(
        "/auth/login",
        data
    );

    return response.data;
}

export async function logout() {
    
    const response = await api.post(
        "/auth/logout"
    );

    return response.data;
}


export async function getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>("/auth/me");
    return response.data;
}