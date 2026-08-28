export default function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
    return (
        <div className="max-w-3xl">
            <div className="font-mono text-sm uppercase tracking-widest text-seal">{eyebrow}</div>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">{title}</h2>
            <p className="mt-5 font-body text-lg leading-7 text-ink-500">{description}</p>
        </div>
    );
}