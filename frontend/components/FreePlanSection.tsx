// app/components/FreePlanSection.tsx
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";

const plan = [
    { value: "50,000", label: "AI Tokens", note: "per month — enough for regular use on a personal document set" },
    { value: "500", label: "Search Units", note: "per month, covering both chat and retrieval searches" },
    { value: "100 MB", label: "Document Storage", note: "included, no card required" },
];

export default function FreePlanSection() {
    return (
        <section className="border-t border-line bg-surface-muted">
            <Container className="py-24">
                <SectionHeading eyebrow="Free plan" title="Start free. No card required." description="..." />
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {plan.map((p) => (
                        <div key={p.label} className="rounded-xl border border-line bg-surface p-7 text-center">
                            <div className="font-display text-4xl font-semibold text-ink">{p.value}</div>
                            <div className="mt-3 font-mono text-sm uppercase tracking-wide text-ink-500">{p.label}</div>
                            <p className="mt-2 font-body text-sm text-ink-500">{p.note}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}