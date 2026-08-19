import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getFeaturedProducts, getNewArrivals } from "@/services/products";
import CategoryCard from "@/components/ui/CategoryCard";
import ProductCarousel from "@/components/ui/ProductCarousel";
import ProductGrid from "@/components/ui/ProductGrid";
import CuratedSlideshow from "@/components/storefront/CuratedSlideshow";
import HeroSlideshow from "@/components/storefront/HeroSlideshow";

// Catalogue data is safe to cache briefly; admin changes will
// appear within a minute until revalidatePath hooks land.
export const revalidate = 60;

const categories = [
  { name: "Clothing", slug: "clothing", image: "/clothing.png" },
  { name: "Shoes", slug: "shoes", image: "/shoes.jpg" },
  { name: "Bags & Accessories", slug: "bags-accessories", image: "/bags-accessories.jpg" },
  { name: "Beauty & Fragrance", slug: "beauty-fragrance", image: "/beauty-fragrance.png" },
  { name: "Home & Living", slug: "home-living", image: "/image-12.jpg" },
];

const moodCards = [
  { title: "Everyday Essentials", tag: "everyday", desc: "Uniforms for ease", image: "/image-17.jpg" },
  { title: "Soft & Feminine", tag: "feminine", desc: "Delicate details", image: "/image-16.jpg" },
  { title: "Evening Edit", tag: "evening", desc: "Dressed for dusk", image: "/image-6.jpg" },
  { title: "Home Refresh", tag: "home", desc: "Thoughtful objects", image: "/placeholder.jpg" },
];

const lovedMedia: { type: "video" | "image"; src: string; alt: string }[] = [
  { type: "video", src: "/video-1.mp4", alt: "JAS styles in motion" },
  { type: "image", src: "/image-18.jpg", alt: "JAS community favourite" },
  { type: "video", src: "/video-3.mp4", alt: "JAS styles in motion" },
  { type: "video", src: "/video-4.mp4", alt: "JAS styles in motion" },
];

const instagramPosts = [
  { src: "/instagram/insta-1.jpg", href: "https://www.instagram.com/jasmiine.sss/p/DYHl_4oDTAb/" },
  { src: "/instagram/insta-2.jpg", href: "https://www.instagram.com/jasmiine.sss/p/DM7XEJDoxEA/" },
  { src: "/instagram/insta-3.jpg", href: "https://www.instagram.com/jasmiine.sss/p/DTIAn9ljbFO/" },
  { src: "/instagram/insta-4.jpg", href: "https://www.instagram.com/jasmiine.sss/p/DTFg8RKDTFT/" },
];

export default async function HomePage() {
  const [newArrivals, trendingProducts] = await Promise.all([
    getNewArrivals(8),
    getFeaturedProducts(4),
  ]);

  return (
    <div className="flex flex-col w-full bg-brand-bg text-brand-charcoal overflow-x-clip pb-12">
      {/* 1. Hero Section */}
      <section className="relative w-full -mt-16 md:-mt-20 h-[calc(80vh+4rem)] md:h-[calc(90vh+5rem)] bg-brand-beige flex flex-col justify-end md:justify-center overflow-hidden border-b border-brand-border/30">
        <HeroSlideshow />
        {/* Soft bottom vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 via-transparent to-brand-charcoal/10" />

        <div className="relative max-w-7xl mx-auto w-full px-4 md:px-6 py-12 md:py-24 z-10 text-brand-bg md:text-brand-charcoal">
          <div className="max-w-xl flex flex-col gap-3 md:gap-4 md:bg-white/80 md:backdrop-blur-md md:p-10 md:rounded-lg md:shadow-soft border border-transparent md:border-brand-border/40">
            <span className="font-sans text-[10px] md:text-xs font-bold tracking-widest uppercase text-brand-beige md:text-brand-burgundy">
              THE JAS EDIT
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide leading-tight text-white md:text-brand-charcoal">
              Style every part of your life.
            </h1>
            <p className="font-sans text-sm md:text-base leading-relaxed text-brand-beige/90 md:text-brand-taupe">
              Discover fashion, fragrance, beauty and living essentials selected to make every day feel more like you.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
              <Link
                href="/shop"
                className="bg-brand-burgundy text-brand-bg w-full sm:w-auto text-center px-8 py-3.5 rounded-full font-sans text-sm font-semibold tracking-wider hover:bg-brand-rose transition-colors duration-200 shadow-sm"
              >
                Shop New Arrivals
              </Link>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-1 font-sans text-xs font-bold uppercase tracking-wider text-white md:text-brand-charcoal hover:text-brand-burgundy transition-colors py-2"
              >
                Explore JAS <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-16 md:pt-24">
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe block mb-1">
              Shop by Department
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-light">Featured Collections</h2>
          </div>
          <Link
            href="/shop"
            className="font-sans text-xs font-bold uppercase tracking-widest text-brand-burgundy hover:text-brand-charcoal transition-colors inline-flex items-center gap-1.5"
          >
            Shop All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: Horizontal Swipe Carousel | Desktop: 5-column editorial grid */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-5 md:overflow-visible pb-4">
          {categories.map((cat) => (
            <div key={cat.slug} className="w-[180px] sm:w-[220px] md:w-auto flex-shrink-0 snap-start">
              <CategoryCard name={cat.name} slug={cat.slug} image={cat.image} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals ("Just In") */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-20 md:pt-28">
        <div className="text-center md:text-left mb-8 md:mb-10 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-light mb-2">Just In</h2>
            <p className="font-sans text-sm text-brand-taupe">
              Fresh finds for your wardrobe, beauty shelf and home.
            </p>
          </div>
          <Link
            href="/shop?new=1"
            className="hidden md:inline-flex font-sans text-xs font-bold uppercase tracking-widest text-brand-burgundy hover:text-brand-charcoal transition-colors items-center gap-1.5"
          >
            View All New <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {newArrivals.length > 0 ? (
          <ProductCarousel products={newArrivals} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-brand-beige aspect-[4/5] rounded" />
            ))}
          </div>
        )}
      </section>

      {/* 4. Editorial Promotional Split Banner (full-bleed) */}
      <section className="w-full pt-24 md:pt-32">
        <div className="bg-white overflow-hidden flex flex-col md:flex-row">
          {/* Content Area */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center gap-4 md:gap-5 bg-brand-beige/20 order-2 md:order-1">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-burgundy">
              CURATED FOR YOU
            </span>
            <h3 className="font-serif text-2xl md:text-4xl font-light text-brand-charcoal leading-tight">
              More than what you wear.
            </h3>
            <p className="font-sans text-sm md:text-base leading-relaxed text-brand-taupe max-w-md">
              From signature scents to thoughtful home details, discover pieces that bring your personal style into every space.
            </p>
            <Link
              href="/shop"
              className="bg-brand-charcoal text-brand-bg text-center w-full sm:w-fit px-8 py-3.5 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-burgundy transition-all duration-200 mt-4 shadow"
            >
              Discover the Collection
            </Link>
          </div>

          {/* Image Area */}
          <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:h-[450px] relative order-1 md:order-2">
            <CuratedSlideshow />
          </div>
        </div>
      </section>

      {/* 5. Shop by Mood */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-20 md:pt-28">
        <div className="text-center mb-10 md:mb-12">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe block mb-1">
            Visual Edits
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-light">Shop by Mood</h2>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moodCards.map((mood) => (
            <Link
              key={mood.title}
              href={`/shop?mood=${mood.tag}`}
              className="group relative aspect-square bg-brand-beige border border-brand-border/40 rounded-md overflow-hidden shadow-card flex flex-col justify-end p-5 md:p-6"
            >
              <Image
                src={mood.image}
                alt={mood.title}
                fill
                className="object-cover filter grayscale contrast-110 brightness-[0.85] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-charcoal/10 group-hover:bg-brand-charcoal/30 transition-colors duration-300" />
              <div className="relative z-10 text-white">
                <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-brand-beige/85 block mb-0.5">
                  {mood.desc}
                </span>
                <h4 className="font-serif text-base md:text-lg tracking-wide group-hover:text-brand-beige transition-colors">
                  {mood.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Trending Products ("Currently Loved") */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-20 md:pt-28">
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe block mb-1">
              Bestsellers
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-light">Currently Loved</h2>
          </div>
          <Link
            href="/shop?sort=best-selling"
            className="font-sans text-xs font-bold uppercase tracking-widest text-brand-burgundy hover:text-brand-charcoal transition-colors inline-flex items-center gap-1.5"
          >
            View Bestsellers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Community media strip */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible pb-4 mb-8 md:mb-10">
          {lovedMedia.map((media) => (
            <div
              key={media.src}
              className="w-[180px] sm:w-[220px] md:w-auto flex-shrink-0 snap-start aspect-[4/5] relative bg-brand-beige border border-brand-border/40 rounded-md overflow-hidden shadow-card"
            >
              {media.type === "video" ? (
                <video
                  src={media.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={media.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image src={media.src} alt={media.alt} fill className="object-cover" />
              )}
            </div>
          ))}
        </div>

        {trendingProducts.length > 0 ? (
          <ProductGrid products={trendingProducts} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-brand-beige aspect-[4/5] rounded" />
            ))}
          </div>
        )}
      </section>

      {/* 7. Lifestyle/Instagram Gallery */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-20 md:pt-28">
        <div className="text-center mb-8 md:mb-10">
          <a
            href="https://www.instagram.com/jasmiine.sss/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe hover:text-brand-burgundy transition-colors block mb-1"
          >
            @jasmiine.sss
          </a>
          <h2 className="font-serif text-2xl md:text-3xl font-light mb-1">The JAS Life</h2>
          <p className="font-sans text-xs md:text-sm text-brand-taupe">
            Wear it. Style it. Live it. Follow @jasmiine.sss for more.
          </p>
        </div>

        {/* Horizontal scroll on mobile, 4 column row on desktop */}
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-4 pb-4">
          {instagramPosts.map((post, i) => (
            <a
              key={post.src}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[150px] sm:w-[180px] md:w-auto flex-shrink-0 aspect-square relative bg-brand-beige border border-brand-border/40 rounded overflow-hidden snap-start group shadow-sm block"
            >
              <Image
                src={post.src}
                alt={`Instagram feature ${i + 1} from @jasmiine.sss`}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-brand-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
