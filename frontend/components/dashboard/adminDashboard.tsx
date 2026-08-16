"use client";

import { useEffect, useState } from "react";

import {
    getAdminUsers,
    getPlatformStats,
    getUserUsage,
    suspendUser,
    activateUser,
} from "@/services/admin";

import type {
    AdminUser,
    PlatformStats,
    UserUsage,
} from "@/services/admin";


export default function AdminDashboard() {

    const [users, setUsers] =
        useState<AdminUser[]>([]);

    const [stats, setStats] =
        useState<PlatformStats | null>(null);

    const [selectedUser, setSelectedUser] =
        useState<AdminUser | null>(null);

    const [usage, setUsage] =
        useState<UserUsage | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [loadingUsage, setLoadingUsage] =
        useState(false);

    const [error, setError] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState<string | null>(null);


    useEffect(() => {

        loadAdminData();

    }, []);


    async function loadAdminData() {

        try {

            setLoading(true);
            setError("");

            const [
                usersData,
                statsData,
            ] = await Promise.all([
                getAdminUsers(),
                getPlatformStats(),
            ]);

            setUsers(usersData);
            setStats(statsData);

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to load admin dashboard."
            );

        } finally {

            setLoading(false);

        }

    }


    async function handleSuspend(
        user: AdminUser
    ) {

        if (!window.confirm(
            `Suspend ${user.email}?`
        )) {
            return;
        }


        try {

            setActionLoading(user.id);
            setError("");

            await suspendUser(user.id);

            setUsers((current) =>
                current.map((item) =>
                    item.id === user.id
                        ? {
                            ...item,
                            is_active: false,
                        }
                        : item
                )
            );

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to suspend user."
            );

        } finally {

            setActionLoading(null);

        }

    }

    async function handleActivate(user: AdminUser) {

    try {

        setActionLoading(user.id);
        setError("");

        await activateUser(user.id);

            setUsers((current) =>
                current.map((item) =>
                    item.id === user.id
                        ? {
                            ...item,
                            is_active: true,
                        }
                        : item
                )
            );

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to activate user."
            );

        } finally {

            setActionLoading(null);

        }
    }

    async function handleUsage(
        user: AdminUser
    ) {

        try {

            setSelectedUser(user);
            setLoadingUsage(true);
            setUsage(null);
            setError("");

            const data =
                await getUserUsage(user.id);

            setUsage(data);

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Failed to load user usage."
            );

        } finally {

            setLoadingUsage(false);

        }

    }


    if (loading) {

        return (
            <div className="p-8 text-gray-500">
                Loading admin dashboard...
            </div>
        );

    }


    return (

        <div className="p-6 md:p-8">

            <div className="max-w-7xl mx-auto space-y-8">


                {/* Header */}

                <div>

                    <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
                        Administration
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Monitor platform usage and manage users.
                    </p>

                </div>


                {error && (

                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>

                )}


                {/* Platform Stats */}

                <section>

                    <div className="mb-4">

                        <h2 className="text-xl font-semibold text-gray-900">
                            Platform Overview
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Current platform activity and resource usage.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                        <StatCard
                            label="Total Users"
                            value={stats?.total_users ?? 0}
                        />

                        <StatCard
                            label="Total Documents"
                            value={stats?.total_documents ?? 0}
                        />

                        <StatCard
                            label="Requests Today"
                            value={stats?.total_requests_today ?? 0}
                        />

                        <StatCard
                            label="Avg Response Time"
                            value={
                                stats?.avg_response_time_ms != null
                                    ? `${Math.round(
                                        stats.avg_response_time_ms
                                    )} ms`
                                    : "N/A"
                            }
                        />

                        <StatCard
                            label="Tokens Today"
                            value={
                                stats?.total_tokens_today
                                    ?.toLocaleString() ?? "0"
                            }
                        />

                        <StatCard
                            label="Search Units Today"
                            value={
                                stats?.total_search_units_today
                                    ?.toLocaleString() ?? "0"
                            }
                        />

                    </div>

                </section>


                {/* Users */}

                <section>

                    <div className="mb-4">

                        <h2 className="text-xl font-semibold text-gray-900">
                            Users
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage accounts and inspect resource usage.
                        </p>

                    </div>


                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50 border-b border-gray-200">

                                    <tr>

                                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Email
                                        </th>

                                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Role
                                        </th>

                                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Tier
                                        </th>

                                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>

                                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {users.map((item) => (

                                        <tr
                                            key={item.id}
                                            className="border-b last:border-b-0 hover:bg-indigo-50/40 transition"
                                        >

                                            <td className="p-4 font-medium text-gray-900">
                                                {item.email}
                                            </td>

                                            <td className="p-4 text-gray-600 capitalize">
                                                {item.role}
                                            </td>

                                            <td className="p-4">

                                                <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                                    {item.tier ?? "free"}
                                                </span>

                                            </td>

                                            <td className="p-4">

                                                {item.is_active ? (

                                                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                        Active
                                                    </span>

                                                ) : (

                                                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                                                        Suspended
                                                    </span>

                                                )}

                                            </td>

                                            <td className="p-4">

                                                <div className="flex gap-3">

                                                    <button
                                                        onClick={() =>
                                                            handleUsage(item)
                                                        }
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                                                    >
                                                        Usage
                                                    </button>


                                                    {item.is_active === true && (
                                                    <button
                                                        onClick={() => handleSuspend(item)}
                                                        disabled={actionLoading === item.id}
                                                        className="
                                                            rounded-lg
                                                            border border-red-200
                                                            px-3 py-1.5
                                                            text-sm font-medium
                                                            text-red-600
                                                            hover:bg-red-50
                                                            transition
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        {actionLoading === item.id
                                                            ? "Suspending..."
                                                            : "Suspend"
                                                        }
                                                    </button>
                                                )}

                                                {item.is_active === false && (
                                                    <button
                                                        onClick={() => handleActivate(item)}
                                                        disabled={actionLoading === item.id}
                                                        className="
                                                            rounded-lg
                                                            border border-emerald-200
                                                            px-3 py-1.5
                                                            text-sm font-medium
                                                            text-emerald-600
                                                            hover:bg-emerald-50
                                                            transition
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        {actionLoading === item.id
                                                            ? "Activating..."
                                                            : "Activate"
                                                        }
                                                    </button>
                                                )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </section>


                {/* Usage */}

                {selectedUser && (

                    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

                        <div className="flex justify-between items-start">

                            <div>

                                <h2 className="text-xl font-semibold text-gray-900">
                                    User Usage
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedUser.email}
                                </p>

                            </div>


                            <button
                                onClick={() => {
                                    setSelectedUser(null);
                                    setUsage(null);
                                }}
                                className="text-gray-500 hover:text-gray-900"
                            >
                                Close
                            </button>

                        </div>


                        {loadingUsage ? (

                            <p className="mt-6 text-gray-500">
                                Loading usage...
                            </p>

                        ) : usage && (

                            <div className="mt-6 space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                    <UsageCard
                                        label="Tier"
                                        value={usage.tier}
                                    />

                                    <UsageCard
                                        label="Storage"
                                        value={`${usage.storage_used_mb} MB / ${usage.storage_limit_mb} MB`}
                                    />

                                    <UsageCard
                                        label="Monthly Tokens"
                                        value={`${usage.tokens_used_this_month.toLocaleString()} / ${usage.token_limit_this_month.toLocaleString()}`}
                                    />

                                    <UsageCard
                                        label="Search Units"
                                        value={`${usage.search_units_used_this_month.toLocaleString()} / ${usage.search_unit_limit_this_month.toLocaleString()}`}
                                    />

                                </div>


                                <div>

                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        Documents by Type
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

                                        {Object.entries(
                                            usage.documents_by_type
                                        ).map(([type, count]) => (

                                            <div
                                                key={type}
                                                className="border border-gray-200 rounded-xl p-4 hover:-translate-y-0.5 transition"
                                            >

                                                <div className="text-sm text-gray-500 capitalize">
                                                    {type}
                                                </div>

                                                <div className="text-2xl font-bold text-gray-900 mt-1">
                                                    {count}
                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            </div>

                        )}

                    </section>

                )}

            </div>

        </div>

    );
}


function StatCard({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {

    return (

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200">

            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
                {value}
            </p>

        </div>

    );
}


function UsageCard({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="
            bg-gray-50
            border
            border-gray-200
            rounded-xl
            p-5
            hover:-translate-y-0.5
            hover:shadow-sm
            transition-all
            duration-200
        ">

            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="text-lg font-semibold text-gray-900 mt-2">
                {value}
            </p>

        </div>
    );
}