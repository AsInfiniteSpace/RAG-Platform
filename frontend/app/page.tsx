"use client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Button from "@/components/Button";
import TryItLiveSection from "@/components/TryItLiveSection";
import ComparisonSection from "@/components/ComparisonSection";
import FreePlanSection from "@/components/FreePlanSection";
import FinalCTASection from "@/components/FinalCTASection";
import VerifiedStamp from "@/components/VerifiedStamp";
import Link from "next/link";

export default function Home() {
    const { user, loading } = useAuth();

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            {/* Hero */}
            <section className="bg-surface">
                <Container className="py-24 md:py-32">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink">
                            No signup required to try it
                        </div>
                        <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight text-ink sm:text-6xl">
                            Most AI tools give you an answer.
                            <span className="block text-accent">This one shows you the receipts.</span>
                        </h1>
                        <p className="mx-auto mt-8 max-w-xl font-body text-lg leading-8 text-ink-500">
                            Every answer is backed by the exact document excerpts it came from.
                            Inspect what was retrieved. See faithfulness scores.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            {!loading && user ? (
                                <Button href="/dashboard" variant="primary">Go to Dashboard →</Button>
                            ) : !loading ? (
                                <>
                                    <Button href="/register" variant="primary">Register free →</Button>
                                    <Button href="/login" variant="secondary">Login</Button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </Container>
            </section>

            <TryItLiveSection />
            <ComparisonSection />
            <FreePlanSection />
            <FinalCTASection />
        </main>
    );
}