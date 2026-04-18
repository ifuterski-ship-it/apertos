"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, message })
    });

    const result = (await response.json()) as { ok?: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setStatus(result.message ?? "Unable to send your message right now.");
      setIsSubmitting(false);
      return;
    }

    setStatus("Message sent. We will get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe">
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-email" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
        />
      </div>
      {status ? <p className="text-sm uppercase tracking-[0.18em] text-neutral-300">{status}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border border-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending" : "Send Message"}
      </button>
    </form>
  );
}
