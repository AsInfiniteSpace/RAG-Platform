import Link from "next/link";

interface DashboardCardProps {
    title: string;
    description: string;
    href: string;
}

export default function DashboardCard({
    title,
    description,
    href,
}: DashboardCardProps) {
    return (
        <Link
            href={href}
            className="
                group
                block
                rounded-2xl
                border border-gray-200
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:border-blue-200
            "
        >
            <div className="flex items-start justify-between gap-4">

                <div>
                    <h3 className="
                        text-lg
                        font-semibold
                        text-gray-900
                        transition-colors
                        group-hover:text-blue-600
                    ">
                        {title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        {description}
                    </p>
                </div>

                <div className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-50
                    text-blue-600
                    transition-all
                    duration-300
                    group-hover:bg-blue-600
                    group-hover:text-white
                ">
                    →
                </div>

            </div>

            <div className="
                mt-5
                text-sm
                font-medium
                text-blue-600
                opacity-0
                transition-opacity
                duration-300
                group-hover:opacity-100
            ">
                Open →
            </div>
        </Link>
    );
}