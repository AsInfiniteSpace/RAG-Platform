"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/Container";

export default function Navbar() {
    const { user, loading } = useAuth();
    return (
        <header className="sticky top-0 z-50 border-b border-line bg-surface">
            <Container className="flex h-16 items-center justify-between">
                <Link href="/" className="font-display text-lg font-semibold text-ink">
                    RAG Platform
                </Link>
                <nav className="flex items-center gap-4 font-mono text-sm">
                    {!loading && user ? (
                        <Link href="/dashboard" className="rounded-lg bg-ink px-4 py-2 text-white">
                            Dashboard
                        </Link>
                    ) : !loading ? (
                        <>
                            <Link href="/login" className="text-ink-500 hover:text-ink">Login</Link>
                            <Link href="/register" className="rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent-dark">
                                Register free
                            </Link>
                        </>
                    ) : null}
                </nav>
            </Container>
        </header>
    );
}