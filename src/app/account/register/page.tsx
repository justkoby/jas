"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { signUp } from "../actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useUI();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || isPending) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await signUp(new FormData(e.currentTarget));
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast(result.message ?? "Registration successful! Welcome to JAS.");
      // If email confirmation is required there is no session yet;
      // the message above explains the next step.
      router.push("/account/login");
      router.refresh();
    });
  };

  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Create Account" }]} />

        <div className="max-w-md mx-auto mt-10 md:mt-16 bg-white border border-brand-border/40 rounded-lg shadow-card p-8">
          <div className="text-center mb-8">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-burgundy block mb-1">
              Join Us
            </span>
            <h1 className="font-serif text-2xl font-light tracking-wide text-brand-charcoal">
              Create an Account
            </h1>
          </div>

          {!isSupabaseConfigured() && (
            <div className="mb-6 bg-brand-beige/60 border border-brand-border rounded p-3 font-sans text-xs text-brand-taupe leading-relaxed">
              Authentication is not connected yet. Configure Supabase in your
              environment to enable account creation.
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
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ama Serwaa"
                className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
              />
            </div>

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

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your password"
                className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-brand-burgundy text-brand-bg py-3 px-8 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors shadow-sm w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-brand-border/60">
            <p className="font-sans text-xs text-brand-taupe">
              Already have an account?{" "}
              <Link href="/account/login" className="text-brand-burgundy hover:underline font-semibold">
                Sign In instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
