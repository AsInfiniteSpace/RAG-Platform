import api from "@/lib/api";

import type {
    ChatRequest,
    ChatResponse,
} from "@/types/chat";


export async function sendChatMessage(
    data: ChatRequest,
): Promise<ChatResponse> {

    const response = await api.post<ChatResponse>(
        "/chat",
        data,
    );

    return response.data;
}