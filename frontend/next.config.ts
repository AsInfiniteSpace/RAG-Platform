import type { NextConfig } from "next";

const isProduction =
    process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
    async rewrites() {
        if (!isProduction) {
            return [];
        }

        return [
            {
                source: "/api/:path*",
                destination:
                    "https://rag-platform.up.railway.app/:path*",
            },
        ];
    },
};

export default nextConfig;