import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { UIProvider } from "@/context/UIContext";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobileMenuDrawer from "@/components/layout/MobileMenuDrawer";
import CartDrawer from "@/components/layout/CartDrawer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import QuickViewModal from "@/components/ui/QuickViewModal";
import ToastNotification from "@/components/ui/ToastNotification";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JAS | Style your life.",
  description: "Discover fashion, fragrance, beauty and living essentials selected to make every day feel more like you. Curated multi-category lifestyle boutique based in Ghana.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        <UIProvider>
          <CartProvider>
            <WishlistProvider>
              <AnnouncementBar />
              <Header />
              <main className="flex-grow pb-16 md:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
              
              {/* Overlays, Drawers & Portals */}
              <MobileMenuDrawer />
              <CartDrawer />
              <SearchOverlay />
              <QuickViewModal />
              <ToastNotification />
              <WhatsAppButton />
            </WishlistProvider>
          </CartProvider>
        </UIProvider>
      </body>
    </html>
  );
}

