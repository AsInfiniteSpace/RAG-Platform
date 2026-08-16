"use client";

import { FormEvent, useState } from "react";

import { submitContactForm } from "@/services/contact";

import Link from "next/link";


export default function ContactPage() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const [sending, setSending] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const [website, setWebsite] = useState("");


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setSubmitted(false);
        setError("");

        try {

            setSending(true);

            await submitContactForm({
                name,
                email,
                subject,
                message,
                website,
            });

            setSubmitted(true);

            setName("");
            setEmail("");
            setSubject("");
            setMessage("");

        } catch (err: any) {

            setError(
                err.response?.data?.detail ??
                "Unable to send your message. Please try again later."
            );

        } finally {

            setSending(false);

        }

    }


    return (

        <main className="min-h-screen bg-slate-50 px-6 py-16">

            <div className="mx-auto max-w-3xl">

                <div className="mb-10 text-center">

                    <div className="mb-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        Get in touch
                    </div>

                    <h1 className="text-4xl font-bold text-slate-900">
                        Contact Us
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-slate-600">
                        Have a question, found an issue, or have
                        feedback about the platform? Send us a message
                        and we'll get back to you.
                    </p>

                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                    {submitted ? (

                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">

                            <div className="text-4xl mb-4">
                                ✓
                            </div>

                            <h2 className="text-xl font-semibold text-emerald-900">
                                Message sent successfully
                            </h2>

                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-emerald-700">
                                Thank you for contacting us. We have received your message
                                and will get back to you soon.
                            </p>

                            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

                                <Link
                                    href="/"
                                    className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    Back to Home
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Send Another Message
                                </button>

                            </div>

                        </div>

                    ) : (

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        required
                                        maxLength={100}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        placeholder="Your name"
                                    />

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        placeholder="you@example.com"
                                    />

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Subject
                                </label>

                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(event) =>
                                        setSubject(event.target.value)
                                    }
                                    required
                                    maxLength={200}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    placeholder="How can we help?"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Message
                                </label>

                                <textarea
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(event.target.value)
                                    }
                                    required
                                    maxLength={5000}
                                    rows={7}
                                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    placeholder="Tell us how we can help..."
                                />

                            </div>


                            <div className="flex justify-end pt-2">

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {sending
                                        ? "Sending..."
                                        : "Send Message"
                                    }

                                </button>

                            </div>

                            {/* Honeypot field for spam protection */}

                            <div
                                aria-hidden="true"
                                className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
                            >
                                <label htmlFor="website">
                                    Website
                                </label>

                                <input
                                    id="website"
                                    name="website"
                                    type="text"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={website}
                                    onChange={(event) =>
                                        setWebsite(event.target.value)
                                    }
                                />
                            </div>

                        </form>

                    )}


                    

                </div>

            </div>

        </main>

    );

}