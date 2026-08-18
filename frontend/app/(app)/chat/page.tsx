"use client";

import { useEffect, useState } from "react";

import {
    getConversation,
    getConversations,
    deleteConversation,
} from "@/services/conversations";

import { sendChatMessage } from "@/services/chat";
import { getDocuments } from "@/services/documents";

import Link from "next/link";

import type {
    Conversation,
    MessageResponse,
    Source,
    DocumentType,
} from "@/types/chat";

import type { DocumentResponse } from "@/types/document";

export default function ChatPage() {

    const [conversations, setConversations] =
        useState<Conversation[]>([]);

    const [messages, setMessages] =
        useState<MessageResponse[]>([]);

    const [selectedConversation, setSelectedConversation] =
        useState<string | null>(null);

    const [query, setQuery] =
        useState("");

    const [loadingConversations, setLoadingConversations] =
        useState(true);

    const [loadingConversation, setLoadingConversation] =
        useState(false);

    const [sending, setSending] =
        useState(false);

    const [error, setError] =
        useState("");

    const [documents, setDocuments] =
        useState<DocumentResponse[]>([]);

    const [documentType, setDocumentType] =
        useState<DocumentType | "">("");

    const [documentId, setDocumentId] =
        useState<string>("");
    
    const [loadingDocuments, setLoadingDocuments] =
        useState(true);

    const readyDocuments = documents.filter(
        (document) => document.status === "ready"
    );

    const [showMobileChat, setShowMobileChat] = useState(false);

    const availableDocumentTypes = [
        ...new Set(
            readyDocuments.map(
                (document) => document.document_type
            )
        ),
    ];


    async function loadConversations(
        type: DocumentType | "" = documentType,
        id: string = documentId,
    ) {

        try {

            setLoadingConversations(true);

            const data =
                await getConversations(
                    type || undefined,
                    id || undefined,
                );

            setConversations(data);

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to load conversations."
            );

        } finally {

            setLoadingConversations(false);

        }

    }

    async function handleDeleteConversation(
    conversationId: string
    ) {
        if (
            !window.confirm(
                "Are you sure you want to delete this conversation?"
            )
        ) {
            return;
        }

        try {
            setError("");

            await deleteConversation(conversationId);

            setConversations((current) =>
                current.filter(
                    (conversation) =>
                        conversation.id !== conversationId
                )
            );

            if (
                selectedConversation === conversationId
            ) {
                setSelectedConversation(null);
                setMessages([]);
                setShowMobileChat(false);
            }

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to delete conversation."
            );

        }
    }


    async function loadDocuments() {
        try {
            setLoadingDocuments(true);
            setError("");

            const data = await getDocuments();

            setDocuments(data);

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to load documents."
            );

        } finally {

            setLoadingDocuments(false);

        }
    }


    function handleDocumentTypeChange(
        value: DocumentType | ""
    ) {

        setDocumentType(value);
        setDocumentId("");

        setSelectedConversation(null);
        setMessages([]);
        setError("");

        loadConversations(value, "");

    }


    function handleDocumentChange(
        value: string
    ) {

        setDocumentId(value);

        setSelectedConversation(null);
        setMessages([]);
        setError("");

        loadConversations(
            documentType,
            value,
        );

    }


    async function openConversation(
        conversationId: string
    ) {

        try {

            setLoadingConversation(true);
            setError("");

            const conversation =
                await getConversation(
                    conversationId
                );

            setSelectedConversation(
                conversation.id
            );

            setDocumentType(
                conversation.document_type ?? ""
            );

            setDocumentId(
                conversation.document_id ?? ""
            );

            setMessages(
                conversation.messages
            );

            setShowMobileChat(true);

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to load conversation."
            );

        } finally {

            setLoadingConversation(false);

        }

    }


    useEffect(() => {

        loadConversations();
        loadDocuments();

    }, []);


    async function handleSend() {

        const trimmedQuery =
            query.trim();

        if (!trimmedQuery || sending) {
            return;
        }

        try {

            setSending(true);
            setError("");

            const userMessage: MessageResponse = {
                role: "user",
                content: trimmedQuery,
                sources: null,
                created_at:
                    new Date().toISOString(),
            };

            setMessages((current) => [
                ...current,
                userMessage,
            ]);

            setQuery("");


            const response =
                await sendChatMessage({

                    query: trimmedQuery,

                    ...(selectedConversation
                        ? {
                            conversation_id:
                                selectedConversation,
                        }
                        : {}
                    ),

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

                    top_k: 5,

                });


            const assistantMessage:
                MessageResponse = {

                    role: "assistant",

                    content:
                        response.answer,

                    sources:
                        response.sources,

                    created_at:
                        new Date().toISOString(),

                };


            setMessages((current) => [
                ...current,
                assistantMessage,
            ]);


            if (!selectedConversation) {

                setSelectedConversation(
                    response.conversation_id
                );

            }


            await loadConversations();

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to send message."
            );

        } finally {

            setSending(false);

        }

    }

    function formatDocumentType(
        type: DocumentType
    ) {
        return type
            .replace("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }


    function handleNewConversation() {

        setSelectedConversation(null);
        setMessages([]);

        setDocumentType("");
        setDocumentId("");

        setError("");

        setShowMobileChat(true);
    }

        /*
        * ---------------------------------------------------------
        * CHAT PAGE RENDERING STATES
        * ---------------------------------------------------------
        */

        // 1. Documents are still loading
        if (loadingDocuments) {
            return (
                <main className="px-6 py-6">
                    <div className="mx-auto max-w-[1500px]">
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


        // 2. Documents have loaded, but none are ready
        if (readyDocuments.length === 0) {
            return (
                <main className="px-6 py-6">
                    <div className="mx-auto max-w-[1500px]">
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
                                    starting a conversation with your
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


        // 3. At least one document is ready → normal chat UI
        return (
            <main className="px-6 py-6">

                <div className="mx-auto max-w-[1500px]">

                    <div className="flex min-h-[calc(100vh-150px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                        {/* Conversations Sidebar */}

                        <aside
                            className={`w-full shrink-0 flex-col border-r border-slate-200 bg-slate-50 md:flex md:w-72 ${
                                showMobileChat ? "hidden" : "flex"
                            }`}
                        >

                            <div className="border-b border-gray-200 p-5">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <h1 className="text-lg font-semibold text-gray-900">
                                            Conversations
                                        </h1>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Your document chats
                                        </p>

                                    </div>

                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                        {conversations.length}
                                    </span>

                                </div>

                                <button
                                    onClick={handleNewConversation}
                                    className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    + New Conversation
                                </button>

                            </div>


                            {/* Conversation List */}

                            <div className="flex-1 overflow-y-auto p-3">

                                {loadingConversations ? (

                                    <div className="space-y-2">

                                        {[1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="h-16 animate-pulse rounded-xl bg-gray-100"
                                            />
                                        ))}

                                    </div>

                                ) : conversations.length === 0 ? (

                                    <div className="px-5 py-12 text-center">

                                        <div className="mb-3 text-3xl">
                                            💬
                                        </div>

                                        <p className="text-sm font-medium text-gray-700">
                                            No conversations yet
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Start asking questions about your documents.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="space-y-1.5">

                                        {conversations.map((conversation) => {

                                            const active =
                                                selectedConversation ===
                                                conversation.id;

                                            return (
                                                <div
                                                    key={conversation.id}
                                                    className={`group rounded-xl p-3 transition ${
                                                        active
                                                            ? "border border-blue-200 bg-blue-50 shadow-sm"
                                                            : "border border-transparent hover:border-gray-200 hover:bg-white"
                                                    }`}
                                                >

                                                    <div className="flex items-start gap-3">

                                                        {/* Conversation */}

                                                        <button
                                                            onClick={() =>
                                                                openConversation(
                                                                    conversation.id
                                                                )
                                                            }
                                                            className="min-w-0 flex-1 text-left"
                                                        >

                                                            <div className="flex items-start gap-3">

                                                                <div
                                                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                                                                        active
                                                                            ? "bg-blue-600 text-white"
                                                                            : "bg-gray-200 text-gray-600"
                                                                    }`}
                                                                >
                                                                    💬
                                                                </div>

                                                                <div className="min-w-0 flex-1">

                                                                    <div
                                                                        className={`truncate text-sm font-medium ${
                                                                            active
                                                                                ? "text-blue-900"
                                                                                : "text-gray-800"
                                                                        }`}
                                                                    >
                                                                        {conversation.title}
                                                                    </div>

                                                                    <div className="mt-1 text-xs text-gray-500">
                                                                        {new Date(
                                                                            conversation.created_at
                                                                        ).toLocaleString()}
                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </button>


                                                        {/* Delete */}

                                                        <button
                                                            onClick={() =>
                                                                handleDeleteConversation(
                                                                    conversation.id
                                                                )
                                                            }
                                                            title="Delete conversation"
                                                            className="
                                                                shrink-0
                                                                rounded-lg
                                                                p-2
                                                                text-gray-400
                                                                opacity-100
                                                                transition
                                                                md:opacity-0
                                                                md:group-hover:opacity-100
                                                                hover:bg-red-50
                                                                hover:text-red-600
                                                            "
                                                        >
                                                            🗑️
                                                        </button>

                                                    </div>

                                                </div>
                                            );
                                        })}

                                    </div>

                                )}

                            </div>

                        </aside>


                        {/* Main Chat */}

                        <section
                            className={`min-w-0 flex-1 flex-col bg-white ${
                                showMobileChat ? "flex" : "hidden"
                            } md:flex`}
                        >


                            {/* Chat Header */}

                            <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-6">

                                <div className="flex items-center justify-between gap-3">

                                    {/* Mobile back button */}

                                    <button
                                        type="button"
                                        onClick={() => setShowMobileChat(false)}
                                        className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 md:hidden"
                                        aria-label="Back to conversations"
                                    >
                                        ←
                                    </button>

                                    <div className="min-w-0 flex-1">

                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Document Chat
                                        </h2>

                                        <p className="mt-0.5 truncate text-sm text-gray-500">
                                            Ask questions across your knowledge base
                                        </p>

                                    </div>


                                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">

                                        {/* Document Type */}

                                        <select
                                            value={documentType}
                                            onChange={(event) =>
                                                handleDocumentTypeChange(
                                                    event.target.value as
                                                        DocumentType | ""
                                                )
                                            }
                                            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"

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
                                                )
                                            )}

                                        </select>


                                        {/* Specific Document */}

                                        <select
                                            value={documentId}
                                            onChange={(event) =>
                                                handleDocumentChange(
                                                    event.target.value
                                                )
                                            }
                                            disabled={!documentType}
                                            className="w-36 max-w-64 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                                        >

                                            <option value="">
                                                {documentType
                                                    ? "All documents of this type"
                                                    : "Select type first"
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
                                                ))}

                                        </select>

                                    </div>

                                </div>

                            </div>


                            {/* Error */}

                            {error && (
                                <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}


                            {/* Messages */}

                            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 px-4 py-5 sm:px-6 sm:py-6 md:px-8">

                                {loadingConversation ? (

                                    <div className="flex h-full items-center justify-center">

                                        <div className="text-center">

                                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

                                            <p className="mt-3 text-sm text-gray-500">
                                                Loading conversation...
                                            </p>

                                        </div>

                                    </div>

                                ) : messages.length === 0 ? (

                                    <div className="flex h-full items-center justify-center">

                                        <div className="max-w-md text-center">

                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                                                ✨
                                            </div>

                                            <h3 className="mt-5 text-xl font-semibold text-gray-900">
                                                Ask your documents anything
                                            </h3>

                                            <p className="mt-2 text-sm text-gray-500">
                                                Ask a question and the AI will retrieve
                                                relevant information from your selected
                                                documents.
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="mx-auto max-w-4xl space-y-6">

                                        {messages.map(
                                            (message, index) => (
                                                <MessageBubble
                                                    key={`${message.created_at}-${index}`}
                                                    message={message}
                                                />
                                            )
                                        )}

                                        {sending && (
                                            <div className="flex justify-start">

                                                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-5 py-3">

                                                    <div className="flex items-center gap-1.5">

                                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />

                                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />

                                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />

                                                    </div>

                                                </div>

                                            </div>
                                        )}

                                    </div>

                                )}

                            </div>


                            {/* Input */}

                            <div className="border-t border-slate-200 bg-white p-3 sm:p-5">

                                <div className="mx-auto max-w-4xl">

                                    <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-gray-50 p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 sm:gap-3">

                                        <input
                                            value={query}
                                            onChange={(event) =>
                                                setQuery(
                                                    event.target.value
                                                )
                                            }
                                            onKeyDown={(event) => {

                                                if (
                                                    event.key === "Enter" &&
                                                    !event.shiftKey
                                                ) {

                                                    event.preventDefault();

                                                    handleSend();

                                                }

                                            }}
                                            placeholder="Ask a question about your documents..."
                                            disabled={sending}
                                            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-50"
                                        />

                                        <button
                                            onClick={handleSend}
                                            disabled={
                                                sending ||
                                                !query.trim()
                                            }
                                            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
                                        >
                                            {sending
                                                ? "Sending..."
                                                : "Send"
                                            }
                                        </button>

                                    </div>

                                    <p className="mt-2 text-center text-xs text-gray-400">
                                        Press Enter to send
                                    </p>

                                </div>

                            </div>

                        </section>

                    </div>

                </div>

            </main>
        );
    
    
}


function MessageBubble({
    message,
}: {
    message: MessageResponse;
}) {

    const isUser =
        message.role === "user";

    
    return (

        <div
            className={`flex ${
                isUser
                    ? "justify-end"
                    : "justify-start"
            }`}
        >

            <div
                className={`max-w-3xl ${
                    isUser
                        ? "items-end"
                        : "items-start"
                }`}
            >

                <div className="flex items-center gap-2 mb-1.5">

                    {!isUser && (

                        <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                            ✨
                        </div>

                    )}

                    <span className="text-xs font-medium text-gray-500">
                        {isUser
                            ? "You"
                            : "AI Assistant"
                        }
                    </span>

                </div>


                <div
                    className={`rounded-2xl p-4 ${
                        isUser
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }`}
                >

                    <div className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                    </div>


                    {!isUser &&
                        message.sources &&
                        message.sources.length > 0 && (

                        <Sources
                            sources={
                                message.sources
                            }
                        />

                    )}

                </div>

            </div>

        </div>

    );

}


function Sources({
    sources,
}: {
    sources: Source[];
}) {

    return (

        <div className="mt-4 pt-4 border-t border-gray-300">

            <div className="flex items-center gap-2 mb-3">

                <div className="h-6 w-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    📄
                </div>

                <p className="font-semibold text-sm text-gray-800">
                    Sources
                </p>

            </div>


            <div className="space-y-2">

                {sources.map(
                    (source) => (

                    <div
                        key={
                            source.excerpt_number
                        }
                        className="rounded-xl border border-gray-200 bg-white p-3"
                    >

                        <p className="font-medium text-sm text-gray-900">
                            {source.excerpt_number}.
                            {" "}
                            {source.filename}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">

                            Pages{" "}
                            {source.start_page}
                            {" - "}
                            {source.end_page}

                        </p>

                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap leading-5">
                            {source.excerpt}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    );

}
