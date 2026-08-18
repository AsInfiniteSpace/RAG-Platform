"use client";

import { useEffect, useState } from "react";

import { getDocuments } from "@/services/documents";
import { retrieveChunks } from "@/services/retrieval";

import type { DocumentResponse } from "@/types/document";
import type { RetrievedChunk } from "@/types/retrieval";
import type { DocumentType } from "@/types/chat";
import Link from "next/link";

export default function RetrievalPage() {
    const [query, setQuery] = useState("");

    
    const [topK, setTopK] = useState(10);

    const [results, setResults] =
        useState<RetrievedChunk[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [documents, setDocuments] =
        useState<DocumentResponse[]>([]);

    const [documentType, setDocumentType] =
        useState<DocumentType | "">("");

    const [documentId, setDocumentId] = useState("");

    const [loadingDocuments, setLoadingDocuments] =
    useState(true);

    const readyDocuments = documents.filter(
        (document) => document.status === "ready"
    );

    const availableDocumentTypes = [
        ...new Set(
            readyDocuments.map(
                (document) => document.document_type
            )
        ),
    ];

    async function handleRetrieve() {
        const trimmedQuery = query.trim();

        if (!trimmedQuery || loading) {
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResults([]);

            const data = await retrieveChunks({
                query: trimmedQuery,

                ...(documentType
                    ? {
                        document_type: documentType,
                    }
                    : {}),

                ...(documentId
                    ? {
                        document_id: documentId,
                    }
                    : {}),

                top_k: topK,
            });

            setResults(data);
        } catch (err: any) {
            setError(
                err.response?.data?.detail ??
                "Failed to retrieve chunks."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function loadDocuments() {
            try {
                setLoadingDocuments(true);

                const data = await getDocuments();

                setDocuments(data);
            } catch (err) {
                console.error(
                    "Failed to load documents:",
                    err
                );
            } finally {
                setLoadingDocuments(false);
            }
        }

        loadDocuments();
    }, []);

    function handleDocumentTypeChange(
        value: DocumentType | ""
    ) {
        setDocumentType(value);
        setDocumentId("");
        setResults([]);
    }

        if (loadingDocuments) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="text-center">

                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />

                            <p className="mt-3 text-sm text-slate-500">
                                Loading documents...
                            </p>

                        </div>

                    </div>
                </div>
            </main>
        );
    }


    if (readyDocuments.length === 0) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="max-w-md px-6 py-12 text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                                📄
                            </div>

                            <h1 className="mt-5 text-2xl font-bold text-slate-900">
                                No documents ready
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Upload and process a document before
                                using retrieval with your knowledge base.
                            </p>

                            <Link
                                href="/documents"
                                className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Go to Documents
                            </Link>

                        </div>

                    </div>
                </div>
            </main>
        );
    }

    return (

        <main>

            <div className="p-6 md:p-8">

                <div className="max-w-7xl mx-auto">

                    {/* Header */}

                    <div className="mb-8">

                        <div className="flex items-center gap-3">

                            <div className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-gradient-to-br
                                from-indigo-500
                                to-violet-600
                                text-xl
                                text-white
                                shadow-lg
                                shadow-indigo-200
                            ">
                                🔎
                            </div>

                            <div>

                                <h1 className="
                                    text-3xl
                                    font-bold
                                    tracking-tight
                                    text-slate-900
                                ">
                                    Retrieval
                                </h1>

                                <p className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                ">
                                    Inspect how your RAG pipeline retrieves
                                    relevant chunks from your knowledge base.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Retrieval Controls */}

                    <section className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-sm
                    ">

                        <div className="mb-6">

                            <h2 className="
                                text-lg
                                font-semibold
                                text-slate-900
                            ">
                                Search Knowledge Base
                            </h2>

                            <p className="
                                mt-1
                                text-sm
                                text-slate-500
                            ">
                                Enter a question and inspect the chunks
                                returned by hybrid retrieval.
                            </p>

                        </div>


                        {/* Query */}

                        <div>

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-slate-700
                            ">
                                Query
                            </label>

                            <textarea
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Ask something about your documents..."
                                rows={4}
                                className="
                                    w-full
                                    resize-y
                                    rounded-xl
                                    border
                                    border-slate-300
                                    bg-white
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-900
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-indigo-500
                                    focus:ring-2
                                    focus:ring-indigo-100
                                "
                            />

                        </div>


                        {/* Filters */}

                        <div className="
                            mt-5
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-3
                        ">

                            {/* Document Type */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-700
                                ">
                                    Document Type
                                </label>

                                <select
                                    value={documentType}
                                    onChange={(event) =>
                                        handleDocumentTypeChange(
                                            event.target.value as
                                                DocumentType | ""
                                        )
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-slate-900
                                        outline-none
                                        focus:border-indigo-500
                                        focus:ring-2
                                        focus:ring-indigo-100
                                    "
                                >

                                    <option value="">
                                        All Documents
                                    </option>

                                    {availableDocumentTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type
                                                .replace("_", " ")
                                                .replace(/\b\w/g, (char) =>
                                                    char.toUpperCase()
                                                )}
                                        </option>
                                    ))}

                                </select>

                            </div>


                            {/* Specific Document */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-700
                                ">
                                    Document
                                </label>

                                <select
                                    value={documentId}
                                    onChange={(event) => {
                                        setDocumentId(event.target.value);
                                        setResults([]);
                                    }}
                                    disabled={!documentType}
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-slate-900
                                        outline-none
                                        transition
                                        disabled:cursor-not-allowed
                                        disabled:bg-slate-100
                                        disabled:text-slate-400
                                        focus:border-indigo-500
                                        focus:ring-2
                                        focus:ring-indigo-100
                                    "
                                >

                                    <option value="">
                                        {documentType
                                            ? "All documents of this type"
                                            : "Select document type first"
                                        }
                                    </option>

                                    {readyDocuments
                                        .filter(
                                            (document) =>
                                                document.document_type ===
                                                documentType
                                        )
                                        .map((document) => (

                                            <option
                                                key={document.id}
                                                value={document.id}
                                            >
                                                {document.filename}
                                            </option>

                                        ))
                                    }

                                </select>

                            </div>


                            {/* Top K */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-700
                                ">
                                    Results
                                </label>

                                <select
                                    value={topK}
                                    onChange={(event) =>
                                        setTopK(
                                            Number(event.target.value)
                                        )
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-slate-900
                                        outline-none
                                        focus:border-indigo-500
                                        focus:ring-2
                                        focus:ring-indigo-100
                                    "
                                >

                                    <option value={8}>
                                        Top 5
                                    </option>

                                    <option value={12}>
                                        Top 10
                                    </option>

                                    <option value={16}>
                                        Top 15
                                    </option>

                                    <option value={20}>
                                        Top 20
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* Retrieve Button */}

                        <div className="mt-6 flex items-center gap-3">

                            <button
                                onClick={handleRetrieve}
                                disabled={
                                    loading ||
                                    !query.trim()
                                }
                                className="
                                    rounded-xl
                                    bg-indigo-600
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-white
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:bg-indigo-700
                                    hover:shadow-lg
                                    hover:shadow-indigo-100
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {loading
                                    ? "Retrieving..."
                                    : "Retrieve"
                                }
                            </button>

                            {results.length > 0 && !loading && (

                                <span className="
                                    text-sm
                                    text-slate-500
                                ">
                                    {results.length} chunks retrieved
                                </span>

                            )}

                        </div>

                    </section>


                    {/* Error */}

                    {error && (

                        <div className="
                            mt-6
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        ">
                            {error}
                        </div>

                    )}


                    {/* Results */}

                    {results.length > 0 && (

                        <section className="mt-8">

                            <div className="
                                mb-5
                                flex
                                items-end
                                justify-between
                            ">

                                <div>

                                    <h2 className="
                                        text-xl
                                        font-semibold
                                        text-slate-900
                                    ">
                                        Retrieved Chunks
                                    </h2>

                                    <p className="
                                        mt-1
                                        text-sm
                                        text-slate-500
                                    ">
                                        Ranked results returned by
                                        the retrieval pipeline.
                                    </p>

                                </div>

                                <span className="
                                    hidden
                                    rounded-full
                                    bg-indigo-50
                                    px-3
                                    py-1
                                    text-sm
                                    font-medium
                                    text-indigo-700
                                    sm:inline-flex
                                ">
                                    {results.length} results
                                </span>

                            </div>


                            <div className="space-y-4">

                                {results.map(
                                    (result, index) => (

                                    <div
                                        key={result.chunk_id}
                                        className="
                                            group
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-white
                                            p-6
                                            shadow-sm
                                            transition-all
                                            duration-200
                                            hover:-translate-y-1
                                            hover:border-indigo-200
                                            hover:shadow-xl
                                            hover:shadow-indigo-100/50
                                        "
                                    >

                                        <div className="
                                            flex
                                            flex-col
                                            gap-4
                                            sm:flex-row
                                            sm:items-start
                                            sm:justify-between
                                        ">

                                            <div className="
                                                flex
                                                min-w-0
                                                items-start
                                                gap-4
                                            ">

                                                <div className="
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-indigo-50
                                                    text-sm
                                                    font-bold
                                                    text-indigo-600
                                                ">
                                                    {String(
                                                        index + 1
                                                    ).padStart(2, "0")}
                                                </div>


                                                <div className="min-w-0">

                                                    <h3 className="
                                                        truncate
                                                        font-semibold
                                                        text-slate-900
                                                    ">
                                                        {result.filename}
                                                    </h3>

                                                    <div className="
                                                        mt-1
                                                        flex
                                                        flex-wrap
                                                        gap-x-4
                                                        gap-y-1
                                                        text-xs
                                                        text-slate-500
                                                    ">

                                                        <span>
                                                            {result.chunk_type}
                                                        </span>

                                                        <span>
                                                            Pages{" "}
                                                            {result.start_page}
                                                            {" – "}
                                                            {result.end_page}
                                                        </span>

                                                        {(result.data_start_page !== null ||
                                                            result.data_end_page !== null) && (

                                                            <span>
                                                                Data pages{" "}
                                                                {result.data_start_page ?? "-"}
                                                                {" – "}
                                                                {result.data_end_page ?? "-"}
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>


                                            <div className="
                                                shrink-0
                                                rounded-xl
                                                bg-slate-50
                                                px-4
                                                py-2
                                                text-right
                                            ">

                                                <p className="
                                                    text-xs
                                                    font-medium
                                                    uppercase
                                                    tracking-wide
                                                    text-slate-400
                                                ">
                                                    Score
                                                </p>

                                                <p className="
                                                    mt-0.5
                                                    text-lg
                                                    font-bold
                                                    text-slate-900
                                                ">
                                                    {result.score.toFixed(4)}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="
                                            mt-5
                                            rounded-xl
                                            bg-slate-50
                                            p-4
                                        ">

                                            <p className="
                                                whitespace-pre-wrap
                                                text-sm
                                                leading-6
                                                text-slate-700
                                            ">
                                                {result.content}
                                            </p>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </section>

                    )}


                    {/* Empty State */}

                    {!loading &&
                        !error &&
                        query &&
                        results.length === 0 && (

                        <div className="
                            mt-8
                            rounded-2xl
                            border
                            border-dashed
                            border-slate-300
                            bg-white
                            px-6
                            py-12
                            text-center
                        ">

                            <div className="
                                mx-auto
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-indigo-50
                                text-indigo-600
                            ">
                                ?
                            </div>

                            <h3 className="
                                mt-4
                                font-semibold
                                text-slate-900
                            ">
                                No matching chunks found
                            </h3>

                            <p className="
                                mx-auto
                                mt-1
                                max-w-md
                                text-sm
                                text-slate-500
                            ">
                                Try changing your query or expanding
                                the document scope.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </main>
    );
}
