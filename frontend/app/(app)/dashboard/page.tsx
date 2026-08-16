"use client";

import { useAuth } from "@/context/AuthContext";

import UserDashboard from "@/components/dashboard/UserDashboard";
import AdminDashboard from "@/components/dashboard/adminDashboard";

export default function DashboardPage() {

    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="p-8">
                Loading dashboard...
            </div>
        );
    }

    if (user?.role === "admin") {
        return <AdminDashboard />;
    }

    return <UserDashboard />;
}