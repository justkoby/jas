"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Storefront chrome (announcement bar, header, footer).
 * Hidden inside the /admin area, which has its own shell.
 * The mobile bottom nav is intentionally not rendered for now —
 * re-add <MobileBottomNav /> here (plus main padding) to bring it back.
 */
export default function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
