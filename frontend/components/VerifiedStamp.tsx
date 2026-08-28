export default function VerifiedStamp({ className = "" }: { className?: string }) {
    return (
        <div
            className={`inline-flex -rotate-6 items-center justify-center rounded-full border-2 border-dashed border-seal px-4 py-2 font-mono text-xs font-medium uppercase tracking-widest text-seal ${className}`}
        >
            Verified
        </div>
    );
}