import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center px-6">

            <div className="w-full max-w-md">

                {/* Brand */}

                <Link
                    href="/login"
                    className="flex flex-col items-center mb-8"
                >

                    <div className="flex items-center gap-3">

                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white font-bold text-lg shadow-lg">
                            R
                        </div>

                        <div className="leading-tight text-left">

                            <div className="font-bold text-xl text-gray-900">
                                RAG Platform
                            </div>

                            <div className="text-xs text-gray-500">
                                AI Document Intelligence
                            </div>

                        </div>

                    </div>

                </Link>


                {/* Card */}

                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-8">

                    <div className="text-center mb-7">

                        <h1 className="text-2xl font-bold text-gray-900">
                            {title}
                        </h1>

                        <p className="text-sm text-gray-500 mt-2">
                            {subtitle}
                        </p>

                    </div>

                    {children}

                </div>


                <p className="text-center text-xs text-gray-400 mt-6">
                    AI-powered document intelligence
                </p>

            </div>

        </div>
    );
}