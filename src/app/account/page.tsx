import React from "react";
import { redirect } from "next/navigation";
import { Package, User, MapPin } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SignOutButton from "./sign-out-button";

export const dynamic = "force-dynamic";

interface ProfileRow {
  full_name: string | null;
  phone: string | null;
  role: string;
}

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    redirect("/account/login");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .single<ProfileRow>();

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || "there";
  const displayEmail = user.email ?? "";
  const displayPhone = profile?.phone ?? null;

  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumbs items={[{ label: "Account Overview" }]} />

        {/* Welcome Banner */}
        <div className="mt-4 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-brand-border/40 rounded-lg p-6 md:p-8 shadow-card">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-burgundy block mb-1">
              Store Account
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-light tracking-wide text-brand-charcoal">
              Hello, {displayName}
            </h1>
            <p className="text-xs text-brand-taupe mt-1">
              Logged in as {displayEmail}
            </p>
          </div>

          <SignOutButton />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Order History (Left/Center Col) — real orders arrive with checkout */}
          <div className="lg:col-span-2 bg-white border border-brand-border/40 rounded-lg shadow-card p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-brand-border pb-4">
              <Package className="h-5 w-5 text-brand-burgundy" />
              <h2 className="font-serif text-lg tracking-wide uppercase">
                Order History
              </h2>
            </div>

            <p className="text-xs text-brand-taupe py-6">
              You haven&rsquo;t placed any orders yet.
            </p>
          </div>

          {/* Profile & Addresses Sidebars */}
          <div className="space-y-8">
            {/* Account Details Box */}
            <div className="bg-white border border-brand-border/40 rounded-lg shadow-card p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                <User className="h-4.5 w-4.5 text-brand-burgundy" />
                <h3 className="font-serif text-sm tracking-wide uppercase">
                  Profile Details
                </h3>
              </div>
              <div className="text-xs space-y-2 text-brand-taupe">
                <p>
                  <span className="font-semibold text-brand-charcoal block">
                    Full Name:
                  </span>{" "}
                  {displayName}
                </p>
                <p>
                  <span className="font-semibold text-brand-charcoal block">
                    Email:
                  </span>{" "}
                  {displayEmail}
                </p>
                {displayPhone && (
                  <p>
                    <span className="font-semibold text-brand-charcoal block">
                      Phone:
                    </span>{" "}
                    {displayPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Address Book Box — address management arrives with checkout */}
            <div className="bg-white border border-brand-border/40 rounded-lg shadow-card p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                <MapPin className="h-4.5 w-4.5 text-brand-burgundy" />
                <h3 className="font-serif text-sm tracking-wide uppercase">
                  Default Address
                </h3>
              </div>
              <div className="text-xs space-y-2 text-brand-taupe">
                <p>You haven&rsquo;t saved any delivery addresses yet.</p>
                <p>
                  Your address will be saved during checkout so you can reuse it
                  next time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
