import Link from "next/link";

type Variant = "primary" | "secondary";

export default function Button({
    href, children, variant = "primary",
}: { href: string; children: React.ReactNode; variant?: Variant }) {
    const base = "inline-flex items-center justify-center rounded-lg px-7 py-4 font-mono text-sm font-medium uppercase tracking-wide transition";
    const styles: Record<Variant, string> = {
        primary: "bg-accent text-white hover:bg-accent-dark",
        secondary: "border border-line text-ink hover:bg-surface-muted",
    };
    return <Link href={href} className={`${base} ${styles[variant]}`}>{children}</Link>;
}