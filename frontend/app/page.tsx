"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const features = [
    {
        icon: "📄",
        title: "Upload Documents",
        description:
            "Upload your PDFs and other supported documents and let the platform prepare them for intelligent search.",
    },
    {
        icon: "💬",
        title: "Chat With Your Documents",
        description:
            "Ask questions in natural language and receive answers grounded in information from your own documents.",
    },
    {
        icon: "🔎",
        title: "Inspect Retrieval",
        description:
            "See which parts of your documents were retrieved for a question and understand what information the AI is using.",
    },
    {
        icon: "📊",
        title: "Evaluate RAG Quality",
        description:
            "Build evaluation questions and measure whether your system retrieves the right information and produces trustworthy answers.",
    },
];

const steps = [
    {
        number: "01",
        title: "Upload",
        description:
            "Upload your documents to create your personal knowledge base.",
        icon: "📄",
    },
    {
        number: "02",
        title: "Process",
        description:
            "Your documents are processed, divided into useful sections, and prepared for search.",
        icon: "⚙️",
    },
    {
        number: "03",
        title: "Ask or Retrieve",
        description:
            "Chat with your documents or inspect the information retrieved for a particular question.",
        icon: "💬",
    },
    {
        number: "04",
        title: "Evaluate",
        description:
            "Measure retrieval and answer quality so you know how well your knowledge base performs.",
        icon: "📊",
    },
];

const metrics = [
    {
        title: "Hit Rate",
        value: "Did we find it?",
        description:
            "Measures whether the expected information was found among the retrieved results.",
        icon: "🎯",
    },
    {
        title: "MRR",
        value: "How high was it?",
        description:
            "Measures how close the correct information appears to the top of the search results.",
        icon: "📈",
    },
    {
        title: "Faithfulness",
        value: "Is the answer supported?",
        description:
            "Checks whether the generated answer is actually supported by the retrieved information.",
        icon: "✓",
    },
];

export default function Home() {
    const { user, loading } = useAuth();
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">

            {/* Hero */}

            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900">

                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-indigo-400 blur-3xl" />
                    <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-400 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">

                    <div className="max-w-4xl">

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100 backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            AI-powered document intelligence
                        </div>

                        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                            Ask your documents.
                            <span className="block text-indigo-200">
                                Get answers you can verify.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-indigo-100 md:text-xl">
                            Upload your documents, build your own knowledge
                            base, and use AI to find and understand the
                            information that matters to you.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                        {!loading && user ? (

                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                            >
                                Go to Dashboard
                                <span className="ml-2">→</span>
                            </Link>

                        ) : !loading ? (

                            <>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                                >
                                    Get Started
                                    <span className="ml-2">→</span>
                                </Link>

                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                                >
                                    Already have an account? Login
                                </Link>
                            </>

                        ) : null}

                    </div>

                    </div>


                    {/* RAG visual */}

                    <div className="mt-16 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md md:p-7">

                        <div className="mb-5 text-sm font-medium text-indigo-200">
                            How your question becomes an answer
                        </div>

                        <div className="grid gap-3 md:grid-cols-5">

                            <FlowCard
                                icon="❓"
                                title="Your Question"
                                description="Ask naturally"
                            />

                            <FlowArrow />

                            <FlowCard
                                icon="🔎"
                                title="Search"
                                description="Find relevant information"
                            />

                            <FlowArrow />

                            <FlowCard
                                icon="✨"
                                title="AI Answer"
                                description="Answer with sources"
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* What can you do? */}

            <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">

                <SectionHeading
                    eyebrow="WHAT YOU CAN DO"
                    title="One place for your document knowledge"
                    description="Everything you need to turn a collection of documents into something you can search, question, inspect, and evaluate."
                />

                <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                    {features.map((feature) => (

                        <div
                            key={feature.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                        >

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                                {feature.icon}
                            </div>

                            <h3 className="mt-5 text-lg font-semibold text-slate-900">
                                {feature.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {feature.description}
                            </p>

                        </div>

                    ))}

                </div>

            </section>


            {/* How it works */}

            <section className="border-y border-slate-200 bg-white">

                <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">

                    <SectionHeading
                        eyebrow="HOW IT WORKS"
                        title="From document to useful answer"
                        description="You don't need to understand the technology behind the system. Just follow the simple workflow."
                    />

                    <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                        {steps.map((step, index) => (

                            <div
                                key={step.number}
                                className="relative"
                            >

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

                                    <div className="flex items-center justify-between">

                                        <span className="text-sm font-bold text-indigo-600">
                                            {step.number}
                                        </span>

                                        <span className="text-2xl">
                                            {step.icon}
                                        </span>

                                    </div>

                                    <h3 className="mt-7 text-lg font-semibold text-slate-900">
                                        {step.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {step.description}
                                    </p>

                                </div>

                                {index < steps.length - 1 && (
                                    <div className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-xl text-indigo-300 lg:block">
                                        →
                                    </div>
                                )}

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* Chat / Retrieval / Evaluation */}

            <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">

                <SectionHeading
                    eyebrow="THREE WAYS TO WORK WITH YOUR KNOWLEDGE"
                    title="Chat, inspect, and measure"
                    description="Different tools for different questions about your document knowledge base."
                />

                <div className="mt-12 grid gap-6 lg:grid-cols-3">

                    <InfoCard
                        icon="💬"
                        title="Chat"
                        badge="Get answers"
                        description="Ask questions in everyday language. The system searches your documents, finds relevant information, and uses it to generate an answer."
                        points={[
                            "Ask questions naturally",
                            "Answers grounded in your documents",
                            "See the sources behind the answer",
                        ]}
                    />

                    <InfoCard
                        icon="🔎"
                        title="Retrieval"
                        badge="Inspect the search"
                        description="Sometimes you want to see what the system actually found. Retrieval lets you inspect the document sections returned for your question."
                        points={[
                            "See retrieved document chunks",
                            "Inspect relevance scores",
                            "Understand what the AI sees",
                        ]}
                    />

                    <InfoCard
                        icon="📊"
                        title="Evaluation"
                        badge="Measure quality"
                        description="Create questions with known answers and test whether your knowledge base retrieves the right information and produces trustworthy responses."
                        points={[
                            "Build an evaluation dataset",
                            "Measure retrieval quality",
                            "Check answer faithfulness",
                        ]}
                    />

                </div>

            </section>


            {/* Evaluation metrics */}

            <section className="bg-slate-900">

                <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">

                    <div className="max-w-2xl">

                        <div className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
                            UNDERSTAND YOUR RESULTS
                        </div>

                        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                            What do the evaluation numbers mean?
                        </h2>

                        <p className="mt-4 text-base leading-7 text-slate-300">
                            Evaluation can sound technical at first. These
                            three metrics answer three simple questions about
                            your RAG system.
                        </p>

                    </div>


                    <div className="mt-12 grid gap-5 md:grid-cols-3">

                        {metrics.map((metric) => (

                            <div
                                key={metric.title}
                                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                            >

                                <div className="flex items-center justify-between">

                                    <span className="text-2xl">
                                        {metric.icon}
                                    </span>

                                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                                        {metric.title}
                                    </span>

                                </div>

                                <h3 className="mt-7 text-xl font-semibold text-white">
                                    {metric.value}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    {metric.description}
                                </p>

                            </div>

                        ))}

                    </div>


                    <div className="mt-8 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-6">

                        <p className="text-sm leading-6 text-indigo-100">
                            <strong className="text-white">
                                A good evaluation result means more than a
                                high number.
                            </strong>{" "}
                            It gives you confidence that the information being
                            retrieved is relevant and that generated answers
                            are supported by your documents.
                        </p>

                    </div>

                </div>

            </section>


            {/* RAG explanation */}

            <section className="border-b border-slate-200 bg-slate-50">

                <div className="mx-auto max-w-5xl px-6 py-20 text-center md:px-10">

                    <div className="inline-flex rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
                        UNDER THE HOOD
                    </div>

                    <h2 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
                        What is RAG?
                    </h2>

                    <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600">
                        RAG stands for{" "}
                        <strong className="text-slate-900">
                            Retrieval-Augmented Generation
                        </strong>
                        . Instead of asking an AI to answer from memory
                        alone, the system first searches your documents for
                        relevant information and then uses that information
                        to produce the answer.
                    </p>


                    <div className="mt-10 grid items-center gap-3 md:grid-cols-5">

                        <SimpleStep
                            icon="❓"
                            title="Question"
                        />

                        <div className="text-xl text-indigo-400">
                            →
                        </div>

                        <SimpleStep
                            icon="📚"
                            title="Your Documents"
                        />

                        <div className="text-xl text-indigo-400">
                            →
                        </div>

                        <SimpleStep
                            icon="✨"
                            title="Grounded Answer"
                        />

                    </div>

                </div>

            </section>

            {/* Free Plan */}

            <section className="border-y border-slate-200 bg-slate-50">

                <div className="mx-auto max-w-5xl px-6 py-16 md:px-10">

                    <div className="text-center">

                        <div className="inline-flex rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
                            FREE PLAN
                        </div>

                        <h2 className="mt-4 text-3xl font-bold text-slate-900">
                            Start free. Explore the platform.
                        </h2>

                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                            Every free account includes generous limits to help you
                            get started with your document intelligence journey.
                        </p>

                    </div>


                    <div className="mt-10 grid gap-5 md:grid-cols-3">

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">

                            <div className="text-4xl font-bold text-indigo-600">
                                50,000
                            </div>

                            <div className="mt-2 text-lg font-semibold text-slate-900">
                                AI Tokens
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                per month
                            </p>

                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">

                            <div className="text-4xl font-bold text-emerald-600">
                                500
                            </div>

                            <div className="mt-2 text-lg font-semibold text-slate-900">
                                Search Units
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                per month
                            </p>

                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">

                            <div className="text-4xl font-bold text-violet-600">
                                100 MB
                            </div>

                            <div className="mt-2 text-lg font-semibold text-slate-900">
                                Document Storage
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                included
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* CTA */}

            <section className="bg-gradient-to-r from-indigo-600 to-violet-600">

                <div className="mx-auto max-w-4xl px-6 py-20 text-center md:px-10">

                    <h2 className="text-3xl font-bold text-white md:text-4xl">
                        Ready to explore your documents?
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
                        Create your knowledge base and start asking questions
                        about the information you already have.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                    {!loading && user ? (

                        <Link
                            href="/dashboard"
                            className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                        >
                            Continue to Dashboard
                        </Link>

                    ) : !loading ? (

                        <>
                            <Link
                                href="/register"
                                className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                            >
                                Create Your Account
                            </Link>

                            <Link
                                href="/login"
                                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                Login
                            </Link>
                        </>

                    ) : null}

                </div>

                </div>

            </section>


            {/* Contact */}

            <section
                id="contact"
                className="border-b border-slate-200 bg-white"
            >

                <div className="mx-auto max-w-3xl px-6 py-16 text-center md:px-10">

                    <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        CONTACT & FEEDBACK
                    </div>

                    <h2 className="mt-4 text-3xl font-bold text-slate-900">
                        We'd love to hear from you.
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                        Found a problem, have a question, or have an
                        idea that could make the platform better?
                        Send us your feedback.
                    </p>

                </div>

            </section>


            {/* Footer */}

            <footer className="bg-slate-950">

                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">

                    <div>

                        <p className="font-semibold text-white">
                            RAG Platform
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Turn your documents into an intelligent,
                            searchable knowledge base.
                        </p>

                    </div>


                    <div className="flex items-center gap-5 text-sm text-slate-400">

                        <Link
                            href="/login"
                            className="transition hover:text-white"
                        >
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className="transition hover:text-white"
                        >
                            Register
                        </Link>

                        <Link
                            href="/contact"
                            className="transition hover:text-indigo-600"
                        >
                            Contact Form
                        </Link>

                    </div>

                </div>

            </footer>

        </main>
    );
}


/* -------------------------------------------------------------------------- */
/* Small UI components                                                        */
/* -------------------------------------------------------------------------- */

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="max-w-3xl">

            <div className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                {eyebrow}
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {title}
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
                {description}
            </p>

        </div>
    );
}


function FlowCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5">

            <div className="text-2xl">
                {icon}
            </div>

            <p className="mt-3 text-sm font-semibold text-white">
                {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-200">
                {description}
            </p>

        </div>
    );
}


function FlowArrow() {
    return (
        <div className="hidden items-center justify-center text-2xl text-indigo-300 md:flex">
            →
        </div>
    );
}


function InfoCard({
    icon,
    title,
    badge,
    description,
    points,
}: {
    icon: string;
    title: string;
    badge: string;
    description: string;
    points: string[];
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                    {icon}
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {badge}
                </span>

            </div>

            <h3 className="mt-6 text-xl font-semibold text-slate-900">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
                {description}
            </p>

            <div className="mt-6 space-y-3">

                {points.map((point) => (

                    <div
                        key={point}
                        className="flex items-start gap-2 text-sm text-slate-600"
                    >

                        <span className="mt-0.5 text-emerald-500">
                            ✓
                        </span>

                        <span>
                            {point}
                        </span>

                    </div>

                ))}

            </div>

        </div>
    );
}


function SimpleStep({
    icon,
    title,
}: {
    icon: string;
    title: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="text-2xl">
                {icon}
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-800">
                {title}
            </p>

        </div>
    );
}