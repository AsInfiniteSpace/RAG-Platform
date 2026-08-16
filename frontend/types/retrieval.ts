import type { DocumentType } from "@/types/chat";


export interface RetrievalQuery {
    query: string;
    document_type?: DocumentType;
    document_id?: string;
    top_k: number;
}


export interface RetrievedChunk {
    chunk_id: string;
    document_id: string;
    filename: string;
    content: string;
    chunk_type: string;
    start_page: number;
    end_page: number;
    data_start_page: number | null;
    data_end_page: number | null;
    score: number;
}