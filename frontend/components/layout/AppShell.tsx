"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface AppShellProps {
    children: React.ReactNode;
}

export default function AppShell({
    children,
}: AppShellProps) {

    const pathname = usePathname();
    const router = useRouter();

    const {
        user,
        loading,
        logout,
    } = useAuth();

    const [loggingOut, setLoggingOut] = useState(false);


    /*
     * Public pages.
     */
    const isPublicPage =
        pathname === "/" ||
        pathname === "/contact" ||
        pathname === "/login" ||
        pathname === "/register";


    const isAuthPage =
        pathname === "/login" ||
        pathname === "/register";


    const isAdminPage =
        pathname === "/admin" ||
        pathname.startsWith("/admin/");


    /*
     * Protect application routes and admin routes.
     */
    useEffect(() => {

        if (loading) {
            return;
        }


        /*
        * Logged-in users should not see Login/Register.
        */
        if (user && isAuthPage) {

            router.replace(
                user.role === "admin"
                    ? "/admin"
                    : "/dashboard"
            );

            return;
        }


        /*
        * Protected application page.
        */
        if (
            !user &&
            !isPublicPage &&
            !loggingOut
        ) {

            router.replace("/login");

            return;
        }


        /*
        * Admin pages are restricted to admins.
        */
        if (
            user &&
            isAdminPage &&
            user.role !== "admin"
        ) {

            router.replace("/dashboard");

            return;
        }

    }, [
        user,
        loading,
        pathname,
        isAuthPage,
        isPublicPage,
        isAdminPage,
        router,
        loggingOut,
    ]);


    async function handleLogout() {

        setLoggingOut(true);

        await logout();

        router.replace("/");

    }


    /*
     * Authentication pages don't use the application shell.
     */
    if (isAuthPage) {

        return <>{children}</>;

    }


    /*
     * While authentication state is being determined,
     * don't render protected application content.
     */
    if (
        loading &&
        !isPublicPage
    ) {

        return (

            <div className="flex min-h-screen items-center justify-center bg-slate-50">

                <div className="text-sm text-slate-500">
                    Loading...
                </div>

            </div>

        );

    }


    /*
     * Normal user navigation.
     */
    const userNavigation = [
        {
            name: "Home",
            href: "/",
        },
        {
            name: "Documents",
            href: "/documents",
        },
        {
            name: "Retrieval",
            href: "/retrieval",
        },
        {
            name: "Chat",
            href: "/chat",
        },
        {
            name: "Evaluation",
            href: "/evaluation",
        },
    ];


    /*
     * Admin navigation.
     *
     * Admins do not use the normal user's
     * Documents / Retrieval / Chat / Evaluation
     * pages because those operate on user-owned data.
     */
    const adminNavigation = [
        {
            name: "Home",
            href: "/",
        },
        
    ];


    /*
     * Select navigation according to role.
     */
    const navigation =
        user?.role === "admin"
            ? adminNavigation
            : userNavigation;


    return (

        <div className="min-h-screen bg-slate-50 text-slate-900">


            {/* Global Header */}

            <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white">

                <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6">


                    {/* Brand */}

                    <Link
                        href={
                            !user
                                ? "/"
                                : user.role === "admin"
                                    ? "/admin"
                                    : "/dashboard"
                        }
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-sm">
                            R
                        </div>

                        <div className="leading-tight">

                            <div className="font-bold text-slate-900">
                                RAG Platform
                            </div>

                            <div className="text-[11px] text-slate-500">
                                AI Document Intelligence
                            </div>

                        </div>

                    </Link>


                    {/* User Information */}

                    {user && (

                        <div className="flex items-center gap-4">

                            <div className="text-right">

                                <div className="text-sm font-medium text-slate-900">
                                    {user.email}
                                </div>

                                <div className="text-xs capitalize text-slate-500">
                                    {user.role}
                                </div>

                            </div>


                            <button
                                onClick={handleLogout}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                                Logout
                            </button>

                        </div>

                    )}

                </div>

            </header>


            {/* Application Navigation */}

            <div className="border-b border-slate-200 bg-white">

                <nav className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-6">

                    {user ? (

                        /*
                         * Logged-in navigation.
                         *
                         * Normal user:
                         * Home | Documents | Retrieval | Chat | Evaluation
                         *
                         * Admin:
                         * Home | Admin
                         */
                        navigation.map((item) => {

                            const active =
                                pathname === item.href ||
                                pathname.startsWith(
                                    `${item.href}/`
                                );


                            return (

                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                                        active
                                            ? "text-indigo-700"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >

                                    {item.name}

                                    {active && (

                                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-indigo-600" />

                                    )}

                                </Link>

                            );

                        })

                    ) : (

                        /*
                         * Guest navigation.
                         */
                        <>

                            <Link
                                href="/"
                                className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                                    pathname === "/"
                                        ? "text-indigo-700"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >

                                Home

                                {pathname === "/" && (

                                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-indigo-600" />

                                )}

                            </Link>


                            <Link
                                href="/contact"
                                className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                                    pathname === "/contact"
                                        ? "text-indigo-700"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Contact
                            </Link>

                        </>

                    )}

                </nav>

            </div>


            {/* Page Content */}

            <main>
                {children}
            </main>

        </div>

    );

}