"use client";

import DashboardCard from "@/components/dashboard/DashboardCard";

export default function UserDashboard() {

    return (
        <div className="p-8">

            <div className="max-w-7xl mx-auto">

                <div className="mb-8">

                    <h1 className="
                        text-3xl
                        font-bold
                        text-gray-900
                    ">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage your documents and AI-powered
                        document intelligence tools.
                    </p>

                </div>


                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-3
                    gap-5
                ">

                    <DashboardCard
                        title="Documents"
                        description="Upload, manage and process your documents."
                        href="/documents"
                    />

                    <DashboardCard
                        title="Retrieval"
                        description="Inspect how your RAG system retrieves relevant chunks."
                        href="/retrieval"
                    />

                    <DashboardCard
                        title="Chat"
                        description="Ask questions across your document knowledge base."
                        href="/chat"
                    />

                    <DashboardCard
                        title="Evaluation"
                        description="Measure retrieval quality and RAG faithfulness."
                        href="/evaluation"
                    />

                </div>

            </div>

        </div>
    );
}