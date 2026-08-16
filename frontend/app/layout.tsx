import type { Metadata } from "next";

import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
    title: "RAG Platform",
    description: "AI Document Intelligence Platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}