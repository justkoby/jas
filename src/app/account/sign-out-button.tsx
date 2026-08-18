"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "./actions";

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/account/login");
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="flex items-center gap-2 border border-brand-border text-brand-taupe hover:text-brand-burgundy hover:border-brand-burgundy rounded-full py-2 px-5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <LogOut className="h-4 w-4" /> {isPending ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
