// app/components/ComparisonSection.tsx
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";

const comparisons = [
    {
        row: "Sources",
        typical: "May cite a source that doesn't actually say what's claimed",
        yours: "Every citation is checked against the actual retrieved text",
    },
    {
        row: "What it searched",
        typical: "Black box — you see only the final answer",
        yours: "Inspect the exact document excerpts behind any answer",
    },
    {
        row: "Quality measurement",
        typical: "No way to know how often it's actually right",
        yours: "Built-in evaluation: hit rate, ranking quality, faithfulness",
    },
];

export default function ComparisonSection() {
    return (
        <section className="bg-surface">
            <Container className="py-24">
                <SectionHeading eyebrow="Why not just use" title="Typical AI chat tools" description="..." />
                <div className="mt-12 overflow-hidden rounded-xl border border-line">
                    <div className="grid grid-cols-3 border-b border-line bg-surface-muted font-mono text-sm">
                        <div className="p-5"></div>
                        <div className="p-5 text-ink-500">Typical AI chat tools</div>
                        <div className="p-5 font-medium text-accent">This platform</div>
                    </div>
                    {comparisons.map((c) => (
                        <div key={c.row} className="grid grid-cols-3 border-b border-line font-body text-base last:border-b-0">
                            <div className="p-5 font-medium text-ink">{c.row}</div>
                            <div className="p-5 text-ink-500">{c.typical}</div>
                            <div className="border-l border-line bg-surface-muted p-5 text-ink">{c.yours}</div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}