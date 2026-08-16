import type { DocumentType } from "@/types/chat";

export interface RetrievalRequest {
    query: string;
    document_type?: DocumentType;
    document_id?: string;
    top_k?: number;
}

export interface RetrievedChunk {
    chunk_id: string;
    document_id: string;
    filename: string;
    content: string;
    chunk_type: string;
    start_page: number;
    end_page: number;
    data_start_page?: number | null;
    data_end_page?: number | null;
    score: number;
}

export interface EvalQuestion {
    id: string;
    question: string;
    expected_chunk_ids: string[];
}

export interface EvalQuestionCreate {
    question: string;
    expected_chunk_ids: string[];
}

export interface CitedSource {
    excerpt_number: number;
    chunk_id: string;
    content: string;
}

export interface EvalQuestionResult {
    question: string;
    expected_chunk_ids: string[];
    all_found: boolean;
    fraction_found: number;
    found_chunk_ids: string[];
    ranks: number[];
    generated_answer: string | null;
    faithful: boolean | null;
    unsupported_claims: string[];
    cited_sources: CitedSource[];
}

export interface EvalRunResult {
    total_questions: number;
    hit_rate: number;
    mean_reciprocal_rank: number;
    faithfulness_rate: number;
    details: EvalQuestionResult[];
}