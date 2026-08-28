import Link from "next/link";

export default function ContactLink({ className = "", children }: { className?: string; children: React.ReactNode }) {
    return (
        <Link href="/contact" className={className}>
            {children}
        </Link>
    );
}