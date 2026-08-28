"use client";
import { useState } from "react";
import Link from "next/link";

const SAMPLE_QUESTIONS = [
    "What is the Cage Code associated with the 26-bit Absolute Optical Encoder in the Bill of Materials?",
    "What is the maximum steady-state power draw allowed for the Payload when all sensors are operating?",
    "For a five-aircraft fleet, how many Closed-Cycle Cryocoolers are recommended as initial fleet spares, and what is the MTBF (hours) of that item as listed in the main BOM table?",
];

type LimitState = "session" | "global" | null;

export default function DemoWidget() {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showChunks, setShowChunks] = useState(false);
    const [limitHit, setLimitHit] = useState<LimitState>(null);
    const [error, setError] = useState<string | null>(null);

    async function ask(q: string) {
        if (!q.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demo/chat`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: q }),
            });
            if (res.status === 429) { setLimitHit("session"); return; }
            if (res.status === 503) { setLimitHit("global"); return; }
            if (!res.ok) { setError("Something went wrong — try again."); return; }
            const data = await res.json();
            setResult(data);
            setLimitHit(null);
        } catch {
            setError("Couldn't reach the server — try again in a moment.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-2xl border border-line bg-surface p-7 shadow-sm md:p-9">
            {limitHit === "session" && (
                <LimitMessage title="You've used today's free demo questions" body="Register for unlimited chat, retrieval inspection, and evaluation on your own documents." />
            )}
            {limitHit === "global" && (
                <LimitMessage title="The live demo is popular right now" body="We cap total demo usage per day to keep it running smoothly for everyone. Check back tomorrow, or register to use the full platform now." />
            )}

            {!limitHit && (
                <>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_QUESTIONS.map((q) => (
                            <button
                                key={q}
                                onClick={() => { setQuestion(q); ask(q); }}
                                disabled={loading}
                                className="rounded-full border border-line bg-surface-muted px-4 py-2 font-mono text-sm text-ink-500 hover:bg-line/40 disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <div className="mt-5 flex gap-3">
                        <input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && ask(question)}
                            placeholder="Ask your own question..."
                            className="flex-1 rounded-lg border border-line bg-surface px-5 py-3.5 font-body text-base text-ink placeholder:text-ink-500/50"
                        />
                        <button
                            onClick={() => ask(question)}
                            disabled={loading || !question}
                            className="rounded-lg bg-accent px-6 py-3.5 font-mono text-sm uppercase tracking-wide text-white hover:bg-accent-dark"
                            
                        >
                            {loading ? "Finding..." : "Ask"}
                        </button>
                    </div>
                </>
            )}

            {error && <p className="mt-4 font-body text-sm text-red-600">{error}</p>}

            {result && !limitHit && (
                <div className="mt-6 rounded-xl border border-line bg-surface-muted p-5">
                    <p className="font-body text-base leading-7 text-ink">{result.answer}</p>
                    {result.retrieved_chunks?.length > 0 && (
                        <>
                            <button
                                onClick={() => setShowChunks(!showChunks)}
                                className="mt-4 font-mono text-sm text-accent underline underline-offset-4"
                            >
                                {showChunks ? "Hide" : "Check the citations for verification"} →
                            </button>
                            {showChunks && (
                                <div className="mt-3 space-y-2">
                                    {result.sources.map((source: any, i: number) => (
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
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function LimitMessage({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-6">
            <p className="font-display text-lg text-ink">{title}</p>
            <p className="mt-2 font-body text-base leading-6 text-ink-500">{body}</p>
            <Link href="/register" className="mt-5 inline-flex items-center rounded-lg bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-white hover:bg-accent-dark">
                Register free →
            </Link>
        </div>
    );
}