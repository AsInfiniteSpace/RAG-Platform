import api from "@/lib/api";

import type {
    RetrievalRequest,
    RetrievedChunk,
    EvalQuestion,
    EvalRunResult,
} from "@/types/evaluation";


export async function retrieveForEvaluation(
    payload: RetrievalRequest
): Promise<RetrievedChunk[]> {

    const response = await api.post<RetrievedChunk[]>(
        "/retrieve",
        payload
    );

    return response.data;
}


export async function addEvaluationQuestion(
    question: string,
    expectedChunkIds: string[],
) {
    const response = await api.post<EvalQuestion>(
        "/eval/questions",
        {
            question,
            expected_chunk_ids: expectedChunkIds,
        },
    );

    return response.data;
}


export async function getEvaluationQuestions(): Promise<EvalQuestion[]> {

    const response = await api.get<EvalQuestion[]>(
        "/eval/questions"
    );

    return response.data;
}


export async function runEvaluation(
    topK: number = 10,
): Promise<EvalRunResult> {

    const response = await api.post<EvalRunResult>(
        "/eval/run",
        null,
        {
            params: {
                top_k: topK,
            },
        }
    );

    return response.data;
}