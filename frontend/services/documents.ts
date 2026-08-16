import api from "@/lib/api";

import type {
    DocumentResponse,
    DocumentType,
    BatchUploadResult,
} from "@/types/document";


export async function uploadDocument(
    file: File,
    documentType: DocumentType,
): Promise<DocumentResponse> {

    const formData = new FormData();

    formData.append("file", file);
    formData.append("document_type", documentType);

    const response = await api.post<DocumentResponse>(
        "/documents/upload",
        formData,
    );

    return response.data;
}


export async function uploadDocumentsBatch(
    files: File[],
    documentType: DocumentType,
): Promise<BatchUploadResult[]> {

    const formData = new FormData();

    formData.append("document_type", documentType);

    files.forEach((file) => {
        formData.append("files", file);
    });

    const response = await api.post<BatchUploadResult[]>(
        "/documents/upload-batch",
        formData,
    );

    return response.data;
}


export async function getDocuments(): Promise<DocumentResponse[]> {

    const response = await api.get<DocumentResponse[]>(
        "/documents",
    );

    return response.data;
}


export async function deleteDocument(
    documentId: string,
): Promise<void> {

    await api.delete(
        `/documents/${documentId}`,
    );
}

export async function reindexDocument(
    documentId: string
) {
    const response = await api.post(
        `/documents/${documentId}/reindex`
    );

    return response.data;
}