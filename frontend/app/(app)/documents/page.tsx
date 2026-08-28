"use client";

import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/utils/api-error";

import {
    deleteDocument,
    getDocuments,
    uploadDocument,
    uploadDocumentsBatch,
    reindexDocument,
} from "@/services/documents";

import type {
    DocumentResponse,
    DocumentType,
} from "@/types/document";


const documentTypes: DocumentType[] = [
    "invoice",
    "resume",
    "contract",
    "general",
];


function formatDocumentType(type: DocumentType) {
    return type
        .replace("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}


function getStatusStyle(status: string) {

    const normalized = status.toLowerCase();

    if (
        normalized === "processed" ||
        normalized === "completed" ||
        normalized === "ready"
    ) {
        return {
            label: "Ready",
            className:
                "bg-emerald-50 text-emerald-700 border-emerald-200",
            dot: "bg-emerald-500",
        };
    }

    if (
        normalized === "processing" ||
        normalized === "pending" ||
        normalized === "indexing"
    ) {
        return {
            label: "Processing",
            className:
                "bg-amber-50 text-amber-700 border-amber-200",
            dot: "bg-amber-500",
        };
    }

    if (
        normalized === "failed" ||
        normalized === "error"
    ) {
        return {
            label: "Failed",
            className:
                "bg-red-50 text-red-700 border-red-200",
            dot: "bg-red-500",
        };
    }

    return {
        label: status,
        className:
            "bg-slate-50 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
    };
}


export default function DocumentsPage() {

    const [documents, setDocuments] =
        useState<DocumentResponse[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [selectedFiles, setSelectedFiles] =
        useState<File[]>([]);

    const [documentType, setDocumentType] =
        useState<DocumentType>("general");

    const [uploading, setUploading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [dragging, setDragging] =
        useState(false);


    async function loadDocuments(showLoading = true) {

    try {

        if (showLoading) {
            setLoading(true);
        }

        const data = await getDocuments();

        setDocuments(data);

    } catch (err: any) {

        setError(
            getApiErrorMessage(
                err,
                "Failed to load documents."
            )
        );

    } finally {

        if (showLoading) {
            setLoading(false);
        }

    }
}


    useEffect(() => {

        loadDocuments(true);

        const interval = setInterval(() => {
            loadDocuments(false);
        }, 5000);

        return () => {
            clearInterval(interval);
        };

    }, []);


    function updateSelectedFiles(files: File[]) {

        setSelectedFiles(files);

        setError("");
        setMessage("");

    }


    function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        if (!event.target.files) {
            return;
        }

        updateSelectedFiles(
            Array.from(event.target.files)
        );

    }


    function handleDrop(
        event: React.DragEvent<HTMLDivElement>
    ) {

        event.preventDefault();

        setDragging(false);

        const files =
            Array.from(event.dataTransfer.files);

        if (files.length > 0) {
            updateSelectedFiles(files);
        }

    }


    async function handleUpload() {

        if (selectedFiles.length === 0) {

            setError(
                "Please select at least one file."
            );

            return;
        }

        try {

            setUploading(true);
            setError("");
            setMessage("");

            if (selectedFiles.length === 1) {

                await uploadDocument(
                    selectedFiles[0],
                    documentType,
                );

                setMessage(
                    "Document uploaded successfully."
                );

            } else {

                const results =
                    await uploadDocumentsBatch(
                        selectedFiles,
                        documentType,
                    );

                const successful =
                    results.filter(
                        (result) => result.success
                    ).length;

                const failed =
                    results.length - successful;

                setMessage(
                    `${successful} document(s) uploaded successfully${
                        failed > 0
                            ? `, ${failed} failed.`
                            : "."
                    }`
                );

            }

            setSelectedFiles([]);

            await loadDocuments();

        } catch (err: any) {

            setError(
                getApiErrorMessage(
                    err,
                    "Upload failed."
                )
            );

        } finally {

            setUploading(false);

        }

    }


    async function handleDelete(
        documentId: string
    ) {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this document?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");
            setMessage("");

            await deleteDocument(documentId);

            setDocuments((current) =>
                current.filter(
                    (document) =>
                        document.id !== documentId
                )
            );

            setMessage(
                "Document deleted successfully."
            );

        } catch (err: any) {

            setError(
                getApiErrorMessage(
                    err,
                    "Failed to delete document."
                )
            );

        }

    }


    async function handleReindex(
        documentId: string
    ) {

        try {

            setError("");
            setMessage("");

            await reindexDocument(documentId);

            setMessage(
                "Reindexing started successfully."
            );

            await loadDocuments();

        } catch (err: any) {

            setError(
                getApiErrorMessage(
                    err,
                    "Failed to start reindexing."
                )
            );

        }

    }


    return (

        

            <main className="p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    
                        
                        {/* Page Header */}

                        <div className="mb-8">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl text-white shadow-lg shadow-indigo-200">
                                    📄
                                </div>

                                <div>

                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                        Documents
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Build and manage your AI knowledge base.
                                    </p>

                                </div>

                            </div>

                        </div>             
                          

                        {/* Upload Card */}

                        <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <h2 className="text-lg font-semibold text-slate-900">

                                    Upload Documents

                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    Add documents to your knowledge base for retrieval and chat.

                                </p>

                            </div>


                            <div className="p-6">

                                {/* Type */}

                                <div className="mb-6 max-w-sm">

                                    <label className="mb-2 block text-sm font-medium text-slate-700">

                                        Document Type

                                    </label>

                                    <select
                                        value={documentType}
                                        onChange={(event) =>
                                            setDocumentType(
                                                event.target.value as DocumentType
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >

                                        {documentTypes.map((type) => (

                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {formatDocumentType(type)}
                                            </option>

                                        ))}

                                    </select>

                                </div>


                                {/* Dropzone */}

                                <div
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setDragging(true);
                                    }}
                                    onDragLeave={() =>
                                        setDragging(false)
                                    }
                                    onDrop={handleDrop}
                                    className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
                                        dragging
                                            ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                                            : "border-slate-300 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/40"
                                    }`}
                                >

                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">

                                        ☁️

                                    </div>

                                    <h3 className="mt-4 font-semibold text-slate-900">

                                        Drop your files here

                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">

                                        or click to browse from your computer

                                    </p>

                                    <p className="mt-3 text-xs text-slate-400">

                                        Multiple files supported

                                    </p>

                                </div>


                                {/* Selected files */}

                                {selectedFiles.length > 0 && (

                                    <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">

                                        <div className="mb-3 flex items-center justify-between">

                                            <p className="text-sm font-semibold text-slate-800">

                                                Selected files

                                            </p>

                                            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">

                                                {selectedFiles.length} file
                                                {selectedFiles.length === 1
                                                    ? ""
                                                    : "s"
                                                }

                                            </span>

                                        </div>


                                        <div className="space-y-2">

                                            {selectedFiles.map(
                                                (file) => (

                                                <div
                                                    key={`${file.name}-${file.size}`}
                                                    className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
                                                >

                                                    <span>
                                                        📄
                                                    </span>

                                                    <span className="truncate text-slate-700">

                                                        {file.name}

                                                    </span>

                                                </div>

                                            ))}

                                        </div>

                                    </div>

                                )}


                                {/* Upload button */}

                                <div className="mt-6 flex flex-col items-end">

                                    <button
                                        type="button"
                                        onClick={handleUpload}
                                        disabled={
                                            uploading ||
                                            selectedFiles.length === 0
                                        }
                                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                    >

                                        {uploading
                                            ? "Uploading..."
                                            : "Upload Documents"
                                        }

                                    </button>


                                    {/* Upload error */}

                                    {error && (

                                        <div className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                                            {error}

                                        </div>

                                    )}


                                    {/* Upload success */}

                                    {message && (

                                        <div className="mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

                                            {message}

                                        </div>

                                    )}

                                </div>

                            </div>

                        </section>


                        {/* Documents Header */}

                        <div className="mb-5 flex items-end justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">

                                    Your Documents

                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    {documents.length} document
                                    {documents.length === 1
                                        ? ""
                                        : "s"
                                    } in your knowledge base

                                </p>

                            </div>

                        </div>


                        {/* Documents */}

                        {loading ? (

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                                {[1, 2, 3].map((item) => (

                                    <div
                                        key={item}
                                        className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
                                    />

                                ))}

                            </div>

                        ) : documents.length === 0 ? (

                            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">

                                    📁

                                </div>

                                <h3 className="mt-4 font-semibold text-slate-900">

                                    No documents yet

                                </h3>

                                <p className="mt-1 text-sm text-slate-500">

                                    Upload your first document to start building your knowledge base.

                                </p>

                            </div>

                        ) : (

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                                {documents.map(
                                    (document) => {

                                    const status =
                                        getStatusStyle(
                                            document.status
                                        );

                                    return (

                                        <article
                                            key={document.id}
                                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
                                        >

                                            {/* Top */}

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-xl">

                                                        📄

                                                    </div>

                                                    <div className="min-w-0">

                                                        <h3 className="truncate font-semibold text-slate-900">

                                                            {document.filename}

                                                        </h3>

                                                        <p className="mt-0.5 text-xs text-slate-500">

                                                            {formatDocumentType(
                                                                document.document_type
                                                            )}

                                                        </p>

                                                    </div>

                                                </div>


                                                <span
                                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                                                >

                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                                    />

                                                    {status.label}

                                                </span>

                                            </div>


                                            {/* Date */}

                                            <div className="mt-5 border-t border-slate-100 pt-4">

                                                <p className="text-xs text-slate-400">

                                                    Added

                                                </p>

                                                <p className="mt-1 text-sm text-slate-600">

                                                    {new Date(
                                                        document.created_at
                                                    ).toLocaleString()}

                                                </p>

                                            </div>


                                            {/* Actions */}

                                            <div className="mt-5 flex items-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleReindex(
                                                            document.id
                                                        )
                                                    }
                                                    className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                                                >

                                                    ↻ Reindex

                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            document.id
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                                                >

                                                    Delete

                                                </button>

                                            </div>

                                        </article>

                                    );

                                })}

                            </div>

                        )}
                    
                </div>

            </main>

        

    );

}
