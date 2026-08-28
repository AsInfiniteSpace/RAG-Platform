"use client";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/Container";
import Button from "@/components/Button";

export default function FinalCTASection() {
    const { user, loading } = useAuth();
    return (
        <section className="bg-surface">
            <Container className="py-24 text-center">
                <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
                    Ready to explore your documents?
                </h2>
                <p className="mx-auto mt-4 max-w-xl font-body text-base text-ink-500">
                    Create your knowledge base and start asking questions about the information you already have.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    {!loading && user ? (
                        <Button href="/dashboard" variant="primary">Continue to Dashboard</Button>
                    ) : !loading ? (
                        <>
                            <Button href="/register" variant="primary">Create Your Account</Button>
                            <Button href="/login" variant="secondary">Login</Button>
                        </>
                    ) : null}
                </div>
            </Container>
        </section>
    );
}