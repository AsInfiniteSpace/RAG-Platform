"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getCurrentUser,
    logout as logoutApi,
} from "@/services/auth";


type User = {
    id: string;
    email: string;
    role: string;
};


type AuthContextType = {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};


const AuthContext =
    createContext<AuthContextType | null>(null);



export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        async function loadUser() {

            try {

                const currentUser =
                    await getCurrentUser();

                setUser(currentUser);

            } catch {

                setUser(null);

            } finally {

                setLoading(false);

            }

        }


        loadUser();

    }, []);



    async function logout() {

        await logoutApi();

        setUser(null);

    }

    async function refreshUser() {

        try {

            const currentUser = await getCurrentUser();

            setUser(currentUser);

        } catch {

            setUser(null);

        }

    }


    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>

    );

}



export function useAuth() {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

}

