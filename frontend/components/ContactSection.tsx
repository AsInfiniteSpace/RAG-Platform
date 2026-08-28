import Container from "@/components/Container";
import ContactLink from "@/components/ContactLink";

export default function ContactSection() {
    return (
        <section className="border-t border-line bg-surface-muted">
            <Container className="py-16 text-center">
                <p className="font-mono text-sm uppercase tracking-widest text-accent">
                    Contact & feedback
                </p>
                <h2 className="mt-3 font-display text-2xl font-medium text-ink md:text-3xl">
                    We&apos;d love to hear from you.
                </h2>
                <p className="mx-auto mt-3 max-w-xl font-body text-sm leading-6 text-ink-500">
                    Found a problem, have a question, or have an idea that could make the platform better? Send us your feedback.
                </p>
                <ContactLink className="mt-6 inline-flex items-center rounded-lg border border-line px-6 py-3 font-mono text-sm uppercase tracking-wide text-ink hover:bg-surface">
                    Open contact form →
                </ContactLink>
            </Container>
        </section>
    );
}