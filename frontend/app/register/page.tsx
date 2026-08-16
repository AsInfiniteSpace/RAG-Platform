"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AuthLayout from "@/components/auth/AuthLayout";
import { register } from "@/services/auth";

export default function RegisterPage() {

    const router = useRouter();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    async function handleSubmit(
        event: React.FormEvent
    ) {

        event.preventDefault();

        if (loading) {
            return;
        }

        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }

        try {

            setLoading(true);
            setError("");

            await register({
                email,
                password,
            });

            router.push("/login");

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Registration failed."
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <AuthLayout
            title="Create your account"
            subtitle="Start building your document knowledge base."
        >

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >

                {error && (

                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>

                )}


                <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                </div>


                <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        placeholder="••••••••"
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                </div>


                <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(
                                event.target.value
                            )
                        }
                        placeholder="••••••••"
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                </div>


                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "Creating account..."
                        : "Create account"
                    }
                </button>

            </form>


            <div className="mt-6 text-center text-sm text-gray-500">

                Already have an account?{" "}

                <Link
                    href="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                    Sign in
                </Link>

            </div>

        </AuthLayout>

    );
}