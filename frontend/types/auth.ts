export interface RegisterRequest {
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    id: string;
    email: string;
    role: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}