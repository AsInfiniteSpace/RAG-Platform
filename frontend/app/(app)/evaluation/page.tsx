"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { getDocuments } from "@/services/documents";
import {
    retrieveForEvaluation,
    addEvaluationQuestion,
    getEvaluationQuestions,
    runEvaluation,
} from "@/services/evaluation";

import type { DocumentResponse } from "@/types/document";
import type { DocumentType } from "@/types/chat";

import type {
    RetrievedChunk,
    EvalQuestion,
    EvalRunResult,
} from "@/types/evaluation";

export default function EvaluationPage() {

    const [documents, setDocuments] =
        useState<DocumentResponse[]>([]);

    const [documentType, setDocumentType] =
        useState<DocumentType | "">("");

    const [documentId, setDocumentId] =
        useState("");

    const [query, setQuery] =
        useState("");

    const [topK, setTopK] =
        useState(10);

    const [chunks, setChunks] =
        useState<RetrievedChunk[]>([]);

    const [selectedChunkIds, setSelectedChunkIds] =
        useState<string[]>([]);

    const [questions, setQuestions] =
        useState<EvalQuestion[]>([]);

    const [results, setResults] =
        useState<EvalRunResult | null>(null);

    const [retrieving, setRetrieving] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [running, setRunning] =
        useState(false);

    const [loadingQuestions, setLoadingQuestions] =
        useState(true);

    const [loadingDocuments, setLoadingDocuments] =
        useState(true);

    const [error, setError] =
        useState("");


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


    useEffect(() => {

        async function loadInitialData() {

            try {

                setLoadingDocuments(true);
                setLoadingQuestions(true);
                setError("");

                const [
                    documentData,
                    questionData,
                ] = await Promise.all([
                    getDocuments(),
                    getEvaluationQuestions(),
                ]);

                setDocuments(documentData);
                setQuestions(questionData);

            } catch (err: any) {

                setError(
                    err.response?.data?.detail ??
                    "Failed to load evaluation data."
                );

            } finally {

                setLoadingDocuments(false);
                setLoadingQuestions(false);

            }

        }

        loadInitialData();

    }, []);


    function toggleChunkSelection(
        chunkId: string
    ) {

        setSelectedChunkIds((current) => {

            if (current.includes(chunkId)) {

                return current.filter(
                    (id) => id !== chunkId
                );

            }

            return [
                ...current,
                chunkId,
            ];

        });

    }


    async function handleRetrieve() {

        const trimmedQuery =
            query.trim();

        if (
            !trimmedQuery ||
            retrieving ||
            readyDocuments.length === 0
        ) {
            return;
        }

        try {

            setRetrieving(true);
            setError("");

            setSelectedChunkIds([]);
            setChunks([]);

            const data =
                await retrieveForEvaluation({

                    query: trimmedQuery,

                    ...(documentType
                        ? {
                            document_type:
                                documentType,
                        }
                        : {}
                    ),

                    ...(documentId
                        ? {
                            document_id:
                                documentId,
                        }
                        : {}
                    ),

                    top_k: topK,

                });

            setChunks(data);

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to retrieve chunks."
            );

        } finally {

            setRetrieving(false);

        }

    }


    async function handleAddQuestion() {

        if (
            !query.trim() ||
            selectedChunkIds.length === 0 ||
            saving
        ) {
            return;
        }

        try {

            setSaving(true);
            setError("");

            const newQuestion =
                await addEvaluationQuestion(
                    query.trim(),
                    selectedChunkIds,
                );

            setQuestions((current) => [
                newQuestion,
                ...current,
            ]);

            setQuery("");
            setChunks([]);
            setSelectedChunkIds([]);

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to save evaluation question."
            );

        } finally {

            setSaving(false);

        }

    }


    async function handleRunEvaluation() {

        if (
            running ||
            readyDocuments.length === 0
        ) {
            return;
        }

        try {

            setRunning(true);
            setError("");
            setResults(null);

            const data =
                await runEvaluation(topK);

            setResults(data);

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to run evaluation."
            );

        } finally {

            setRunning(false);

        }

    }


    function handleDocumentTypeChange(
        value: DocumentType | ""
    ) {

        setDocumentType(value);
        setDocumentId("");
        setChunks([]);
        setSelectedChunkIds([]);

    }


    function formatDocumentType(
        type: DocumentType
    ) {

        return type
            .replace("_", " ")
            .replace(
                /\b\w/g,
                (char) => char.toUpperCase()
            );

    }


    /*
     * Loading state
     *
     * Do not decide whether documents exist until
     * getDocuments() has finished.
     */

    if (loadingDocuments) {

        return (

            <main className="p-8 md:p-10">

                <div className="max-w-7xl mx-auto">

                    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="text-center">

                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />

                            <p className="mt-3 text-sm text-slate-500">
                                Loading evaluation...
                            </p>

                        </div>

                    </div>

                </div>

            </main>

        );

    }


    /*
     * No ready documents
     *
     * This handles BOTH:
     *
     * 1. User has never uploaded a document.
     * 2. User has documents, but none are ready.
     */

    if (readyDocuments.length === 0) {

        return (

            <main className="p-8 md:p-10">

                <div className="max-w-7xl mx-auto">

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
                                starting an evaluation of your
                                knowledge base.
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


    /*
     * Normal Evaluation UI
     */

    return (

        <main className="p-8 md:p-10">

            <div className="max-w-7xl mx-auto space-y-8">


                {/* Header */}

                <div>

                    <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
                        RAG Quality
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Evaluation
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Build a test dataset and measure how well
                        your RAG pipeline retrieves and answers questions.
                    </p>

                </div>


                {/* Error */}

                {error && (

                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>

                )}


                {/* Dataset Builder */}

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

                    <div className="mb-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                                01
                            </div>

                            <div>

                                <h2 className="text-xl font-semibold text-gray-900">
                                    Build Evaluation Dataset
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Ask a question, inspect retrieved
                                    candidates, and select the chunks
                                    that contain the expected answer.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Filters */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            >

                                <option value="">
                                    All Documents
                                </option>

                                {availableDocumentTypes.map(
                                    (type) => (

                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {formatDocumentType(type)}
                                    </option>

                                ))}

                            </select>

                        </div>


                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document
                            </label>

                            <select
                                value={documentId}
                                onChange={(event) => {

                                    setDocumentId(
                                        event.target.value
                                    );

                                    setChunks([]);
                                    setSelectedChunkIds([]);

                                }}
                                disabled={!documentType}
                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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


                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Top K
                            </label>

                            <select
                                value={topK}
                                onChange={(event) =>
                                    setTopK(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            >

                                <option value={8}>
                                    8
                                </option>

                                <option value={12}>
                                    12
                                </option>

                                <option value={16}>
                                    16
                                </option>

                                <option value={20}>
                                    20
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* Question */}

                    <div className="mt-5">

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Evaluation Question
                        </label>

                        <textarea
                            value={query}
                            onChange={(event) =>
                                setQuery(
                                    event.target.value
                                )
                            }
                            placeholder="Enter a question whose answer exists in your documents..."
                            rows={4}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />

                    </div>


                    <div className="mt-4">

                        <button
                            onClick={handleRetrieve}
                            disabled={
                                retrieving ||
                                !query.trim() ||
                                readyDocuments.length === 0
                            }
                            className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {retrieving
                                ? "Retrieving..."
                                : "Retrieve Candidates"
                            }
                        </button>

                    </div>


                    {/* Candidates */}

                    {chunks.length > 0 && (

                        <div className="mt-8 space-y-4">

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                                <div>

                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Retrieved Candidates
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Select one or more chunks that
                                        actually contain the answer.
                                    </p>

                                </div>

                                <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                                    {selectedChunkIds.length} selected
                                </div>

                            </div>


                            {chunks.map((chunk, index) => {

                                const selected =
                                    selectedChunkIds.includes(
                                        chunk.chunk_id
                                    );

                                return (

                                    <label
                                        key={chunk.chunk_id}
                                        className={`
                                            block cursor-pointer rounded-xl border p-5
                                            transition-all duration-200
                                            ${
                                                selected
                                                    ? "border-indigo-400 bg-indigo-50 shadow-md"
                                                    : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                                            }
                                        `}
                                    >

                                        <div className="flex items-start gap-4">

                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() =>
                                                    toggleChunkSelection(
                                                        chunk.chunk_id
                                                    )
                                                }
                                                className="mt-1 h-5 w-5 rounded accent-indigo-600"
                                            />

                                            <div className="flex-1 min-w-0">

                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">

                                                    <div>

                                                        <div className="font-semibold text-gray-900">
                                                            #{index + 1}{" "}
                                                            {chunk.filename}
                                                        </div>

                                                        <div className="text-sm text-gray-500 mt-1">
                                                            Pages{" "}
                                                            {chunk.start_page}
                                                            {" - "}
                                                            {chunk.end_page}
                                                        </div>

                                                    </div>

                                                    <div className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                                                        Score{" "}
                                                        {chunk.score.toFixed(4)}
                                                    </div>

                                                </div>

                                                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                                    {chunk.content}
                                                </p>

                                            </div>

                                        </div>

                                    </label>

                                );

                            })}


                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">

                                <button
                                    onClick={handleAddQuestion}
                                    disabled={
                                        saving ||
                                        selectedChunkIds.length === 0
                                    }
                                    className="rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Confirm & Add Question"
                                    }
                                </button>

                                {selectedChunkIds.length > 0 && (

                                    <span className="text-sm text-gray-600">
                                        {selectedChunkIds.length} expected
                                        chunk
                                        {selectedChunkIds.length === 1
                                            ? ""
                                            : "s"
                                        }{" "}
                                        selected
                                    </span>

                                )}

                            </div>

                        </div>

                    )}

                </section>


                {/* Dataset */}

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                                    02
                                </div>

                                <div>

                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Evaluation Dataset
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {questions.length} question
                                        {questions.length === 1
                                            ? ""
                                            : "s"
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    {loadingQuestions ? (

                        <p className="text-gray-500">
                            Loading dataset...
                        </p>

                    ) : questions.length === 0 ? (

                        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                            No evaluation questions yet.
                        </div>

                    ) : (

                        <div className="space-y-3">

                            {questions.map(
                                (question, index) => (

                                <div
                                    key={question.id}
                                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                                >

                                    <div className="font-medium text-gray-900">
                                        {index + 1}.{" "}
                                        {question.question}
                                    </div>

                                    <div className="mt-3 flex flex-col gap-1">

                                        <div className="text-sm text-gray-600">

                                            <span className="font-medium text-gray-800">
                                                Expected chunks:
                                            </span>{" "}

                                            {question.expected_chunk_ids?.length ?? 0}

                                        </div>

                                        {question.expected_chunk_ids?.length > 0 && (

                                            <div className="text-xs text-gray-500 break-all">
                                                {question.expected_chunk_ids.join(", ")}
                                            </div>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* Run Evaluation */}

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 font-bold">
                            03
                        </div>

                        <div>

                            <h2 className="text-xl font-semibold text-gray-900">
                                Run Evaluation
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Run the complete dataset against
                                the current RAG pipeline.
                            </p>

                        </div>

                    </div>


                    <button
                        onClick={handleRunEvaluation}
                        disabled={
                            running ||
                            questions.length === 0 ||
                            readyDocuments.length === 0
                        }
                        className="rounded-xl bg-violet-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {running
                            ? "Running Evaluation..."
                            : "Run Evaluation"
                        }
                    </button>


                    {results && (

                        <div className="mt-8">

                            <EvaluationResults
                                results={results}
                            />

                        </div>

                    )}

                </section>

            </div>

        </main>

    );

}


function EvaluationResults({
    results,
}: {
    results: EvalRunResult;
}) {

    return (

        <div className="space-y-8">


            {/* Metrics */}

            <div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Evaluation Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <MetricCard
                        title="Hit Rate"
                        value={`${(
                            results.hit_rate * 100
                        ).toFixed(1)}%`}
                        description="Expected chunks retrieved"
                        className="bg-indigo-50 border-indigo-100 text-indigo-900"
                    />

                    <MetricCard
                        title="MRR"
                        value={results.mean_reciprocal_rank.toFixed(3)}
                        description="Mean Reciprocal Rank"
                        className="bg-emerald-50 border-emerald-100 text-emerald-900"
                    />

                    <MetricCard
                        title="Faithfulness"
                        value={`${(
                            results.faithfulness_rate * 100
                        ).toFixed(1)}%`}
                        description="Supported generated claims"
                        className="bg-violet-50 border-violet-100 text-violet-900"
                    />

                </div>

            </div>


            {/* Details */}

            <div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detailed Results
                </h3>


                <div className="space-y-5">

                    {results.details.map(
                        (detail, index) => (

                        <div
                            key={`${detail.expected_chunk_ids.join("-")}-${index}`}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                        >

                            <div className="font-semibold text-gray-900">
                                {index + 1}.{" "}
                                {detail.question}
                            </div>


                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">

                                <ResultBadge
                                    label="Retrieval"
                                    value={
                                        detail.all_found
                                            ? "All expected chunks found"
                                            : "Not all expected chunks found"
                                    }
                                    success={detail.all_found}
                                />

                                <ResultBadge
                                    label="Retrieved"
                                    value={`${(
                                        detail.fraction_found * 100
                                    ).toFixed(0)}%`}
                                    success={
                                        detail.fraction_found === 1
                                    }
                                />

                                <ResultBadge
                                    label="Ranks"
                                    value={
                                        detail.ranks.length > 0
                                            ? detail.ranks.join(", ")
                                            : "None"
                                    }
                                    success={
                                        detail.ranks.length > 0
                                    }
                                />

                            </div>


                            <div className="mt-4 text-sm text-gray-700">

                                <span className="font-medium">
                                    Expected:
                                </span>{" "}
                                {detail.expected_chunk_ids.length}

                                <span className="mx-2 text-gray-400">
                                    |
                                </span>

                                <span className="font-medium">
                                    Found:
                                </span>{" "}
                                {detail.found_chunk_ids.length}

                            </div>


                            {detail.generated_answer && (

                                <div className="mt-5 rounded-xl bg-white border border-gray-200 p-4">

                                    <p className="font-medium text-gray-900 mb-2">
                                        Generated Answer
                                    </p>

                                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                        {detail.generated_answer}
                                    </p>

                                </div>

                            )}


                            {detail.unsupported_claims.length > 0 && (

                                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

                                    <p className="font-medium text-amber-900 mb-2">
                                        Unsupported Claims
                                    </p>

                                    <ul className="list-disc ml-5 text-sm text-amber-800">

                                        {detail.unsupported_claims.map(
                                            (claim, claimIndex) => (

                                            <li key={claimIndex}>
                                                {claim}
                                            </li>

                                        ))}

                                    </ul>

                                </div>

                            )}


                            {detail.cited_sources.length > 0 && (

                                <div className="mt-5">

                                    <p className="font-medium text-gray-900 mb-3">
                                        Cited Sources
                                    </p>

                                    <div className="space-y-3">

                                        {detail.cited_sources.map(
                                            (source) => (

                                            <div
                                                key={`${source.chunk_id}-${source.excerpt_number}`}
                                                className="rounded-xl border border-gray-200 bg-white p-4"
                                            >

                                                <div className="font-medium text-gray-900 text-sm">
                                                    {source.excerpt_number}.
                                                    {" "}
                                                    Chunk{" "}
                                                    {source.chunk_id}
                                                </div>

                                                <p className="text-gray-700 mt-2 text-sm leading-6 whitespace-pre-wrap">
                                                    {source.content}
                                                </p>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            )}

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}


function MetricCard({
    title,
    value,
    description,
    className,
}: {
    title: string;
    value: string;
    description: string;
    className?: string;
}) {

    return (

        <div
            className={`
                rounded-2xl border p-5
                shadow-sm
                transition-all duration-200
                hover:-translate-y-1 hover:shadow-lg
                ${className ?? "bg-white border-gray-200"}
            `}
        >

            <p className="text-sm font-medium opacity-70">
                {title}
            </p>

            <p className="text-3xl font-bold mt-2">
                {value}
            </p>

            <p className="text-xs mt-2 opacity-70">
                {description}
            </p>

        </div>

    );

}


function ResultBadge({
    label,
    value,
    success,
}: {
    label: string;
    value: string;
    success: boolean;
}) {

    return (

        <div
            className={`
                rounded-xl border p-3
                ${
                    success
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                }
            `}
        >

            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </div>

            <div
                className={`
                    mt-1 text-sm font-medium
                    ${
                        success
                            ? "text-emerald-800"
                            : "text-amber-800"
                    }
                `}
            >
                {value}
            </div>

        </div>

    );

}