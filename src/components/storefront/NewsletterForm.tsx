"use client";

import React, { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/services/newsletter";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || isPending) return;
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await subscribeNewsletter(new FormData(e.currentTarget));
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "Subscribed!");
      setEmail("");
    });
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-white border border-brand-border rounded-full py-3 px-5 text-sm text-brand-charcoal placeholder-brand-taupe/60 focus:outline-none focus:border-brand-burgundy font-sans"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-brand-burgundy text-brand-bg py-3 px-8 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "JOINING..." : "SUBSCRIBE"}
        </button>
      </form>

      {message && (
        <p className="font-sans text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2.5 mt-3">
          {message}
        </p>
      )}
      {error && (
        <p className="font-sans text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5 mt-3">
          {error}
        </p>
      )}
    </div>
  );
}
