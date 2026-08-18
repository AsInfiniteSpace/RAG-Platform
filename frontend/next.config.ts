import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
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