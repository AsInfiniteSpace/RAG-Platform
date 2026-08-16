import { UUID } from "crypto";

export type DocumentType =
    | "invoice"
    | "resume"
    | "contract"
    | "research_paper"
    | "general";

export interface DocumentResponse {
    id: string;
    filename: string;
    document_type: DocumentType;
    status: string;
    created_at: string;
}

export interface BatchUploadResult {
    filename: string;
    success: boolean;
    document_id: string | null;
    error: string | null;
}