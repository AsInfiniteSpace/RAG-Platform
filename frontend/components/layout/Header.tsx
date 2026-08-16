"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const router = useRouter();
    const { user, logout } = useAuth();

    async function handleLogout() {
        await logout();
        router.push("/login");
    }

    return (
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white">
            <div className="flex h-full items-center justify-between px-8">

                <div>
                    <p className="text-sm font-medium text-gray-700">
                        AI Document Intelligence
                    </p>
                </div>

                <div className="flex items-center gap-4">

                    {user && (
                        <div className="text-right">
                            <p className="text-sm font-medium text-black">
                                {user.email}
                            </p>

                            <p className="text-xs capitalize text-gray-500">
                                {user.role}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
                    >
                        Logout
                    </button>

                </div>

            </div>
        </header>
    );
}