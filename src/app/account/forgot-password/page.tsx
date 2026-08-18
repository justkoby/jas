"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { requestPasswordReset } from "../actions";

export default function ForgotPasswordPage() {
  const { showToast } = useUI();
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
      const result = await requestPasswordReset(new FormData(e.currentTarget));
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "If an account exists, a reset link has been sent.");
      showToast("Password reset email requested.", "info");
    });
  };

  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumbs
          items={[{ label: "Account", href: "/account" }, { label: "Forgot Password" }]}
        />

        <div className="max-w-md mx-auto mt-10 md:mt-16 bg-white border border-brand-border/40 rounded-lg shadow-card p-8">
          <div className="text-center mb-8">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-burgundy block mb-1">
              Account Recovery
            </span>
            <h1 className="font-serif text-2xl font-light tracking-wide text-brand-charcoal">
              Forgot Your Password?
            </h1>
            <p className="font-sans text-xs text-brand-taupe mt-3 leading-relaxed">
              Enter the email address linked to your JAS account and we&rsquo;ll
              send you a link to reset your password.
            </p>
          </div>

          {message && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded p-3 font-sans text-xs text-emerald-700 leading-relaxed">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded p-3 font-sans text-xs text-rose-700 leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ama@gmail.com"
                className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-brand-burgundy text-brand-bg py-3 px-8 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors shadow-sm w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "SENDING..." : "SEND RESET LINK"}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-brand-border/60">
            <p className="font-sans text-xs text-brand-taupe">
              Remembered it?{" "}
              <Link href="/account/login" className="text-brand-burgundy hover:underline font-semibold">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
