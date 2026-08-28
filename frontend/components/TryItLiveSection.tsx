"use client";
import DemoWidget from "@/components/DemoWidget";

export default function TryItLiveSection() {
    return (
        <section className="bg-surface-muted">
            <div className="mx-auto max-w-2xl px-6 py-24 md:px-10">
                <div className="mb-10 text-center">
                    <p className="font-mono text-sm uppercase tracking-widest text-accent">
                        Try it live — no signup needed
                    </p>
                    <p className="mt-4 font-display text-3xl text-ink md:text-4xl">
                        Ask a question about our sample tech specification document.
                    </p>
                    <p className="mt-4 font-body text-base text-ink-500">
                        Want to verify the answer yourself first?{" "}
                        <a href="/demo/HALE-SENSOR_Technical_Specification.pdf" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline underline-offset-4">
                            Open the document in a new tab ↗
                        </a>
                    </p>
                </div>
                <DemoWidget />
            </div>
        </section>
    );
}