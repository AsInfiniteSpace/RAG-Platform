export interface Source {
    excerpt_number: number;
    filename: string;
    start_page: number;
    end_page: number;
    excerpt: string;
}


export interface ChatResponse {
    answer: string;
    sources: Source[];
    conversation_id: string;
}


export interface ChatRequest {
    query: string;
    conversation_id?: string;
    document_type?: DocumentType;
    document_id?: string;
    top_k?: number;
}


export interface MessageResponse {
    role: string;
    content: string;
    sources: Source[] | null;
    created_at: string;
}


export interface Conversation {
    id: string;
    title: string;
    created_at: string;
}


export interface ConversationDetail extends Conversation {
    id: string;
    title: string;
    created_at: string;
    messages: MessageResponse[];

    document_type: DocumentType | null;
    document_id: string | null;
}


export type DocumentType =
    | "invoice"
    | "resume"
    | "contract"
    | "research_paper"
    | "general";