import api from "@/lib/api";

import type {
    Conversation,
    ConversationDetail,
} from "@/types/chat";




export async function getConversations(
    documentType?: string,
    documentId?: string,
) {
    const params: Record<string, string> = {};

    if (documentType) {
        params.document_type = documentType;
    }

    if (documentId) {
        params.document_id = documentId;
    }

    const response = await api.get<Conversation[]>(
        "/conversations",
        { params }
    );

    return response.data;
}

export async function deleteConversation(
    conversationId: string
) {
    const response = await api.delete(
        `/conversations/${conversationId}`
    );

    return response.data;
}


export async function getConversation(
    conversationId: string,
): Promise<ConversationDetail> {

    const response = await api.get<ConversationDetail>(
        `/conversations/${conversationId}`,
    );

    return response.data;
}