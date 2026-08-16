"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const links = [
        {
            href: "/dashboard",
            label: "Dashboard",
        },
        {
            href: "/documents",
            label: "Documents",
        },
        {
            href: "/retrieval",
            label: "Retrieval",
        },
        {
            href: "/chat",
            label: "Chat",
        },
        {
            href: "/evaluation",
            label: "Evaluation",
        },
    ];

    return (
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
            <div className="flex h-full min-h-screen flex-col">

                {/* Brand */}

                <div className="flex h-16 items-center border-b border-gray-200 px-6">
                    <Link
                        href="/dashboard"
                        className="whitespace-nowrap text-xl font-bold text-black"
                    >
                        RAG Platform
                    </Link>
                </div>


                {/* Navigation */}

                <nav className="flex-1 px-3 py-5">

                    <div className="space-y-1">

                        {links.map((link) => {

                            const active =
                                pathname === link.href ||
                                pathname.startsWith(
                                    `${link.href}/`
                                );

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        active
                                            ? "bg-gray-100 text-black"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );

                        })}

                    </div>


                    {/* Admin */}

                    {user?.role === "admin" && (

                        <div className="mt-8 border-t border-gray-200 pt-5">

                            <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Administration
                            </p>

                            <Link
                                href="/admin"
                                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                                    pathname === "/admin" ||
                                    pathname.startsWith("/admin/")
                                        ? "bg-gray-100 text-black"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                }`}
                            >
                                Admin
                            </Link>

                        </div>

                    )}

                </nav>

            </div>
        </aside>
    );
}