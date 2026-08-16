import api from "@/lib/api";

import type {
    RetrievalQuery,
    RetrievedChunk,
} from "@/types/retrieval";


export async function retrieveChunks(
    payload: RetrievalQuery
): Promise<RetrievedChunk[]> {

    const response = await api.post<RetrievedChunk[]>(
        "/retrieve",
        payload
    );

    return response.data;
}