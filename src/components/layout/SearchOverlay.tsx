"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Clock } from "lucide-react";
import { useUI } from "@/context/UIContext";

interface Suggestion {
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string;
  subcategory: string;
}

const popularSearches = ["Linen", "Midi Dress", "Heels", "JAS No. 01", "Vase", "Rose"];
const RECENT_SEARCHES_KEY = "jas_recent_searches";
const MAX_RECENT = 6;

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

export default function SearchOverlay() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useUI();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setRecentSearches(loadRecentSearches());
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const next = [trimmed, ...loadRecentSearches().filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    setRecentSearches(next);
  };

  // Debounced suggestion fetch against the search API route.
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        setSuggestions([]);
        setHasSearched(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok) throw new Error("Search request failed");
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setSuggestions(data.suggestions);
        setHasSearched(true);
      } catch (e) {
        console.error(e);
        setSuggestions([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const closeOverlay = () => {
    setSearchOpen(false);
    setQuery("");
    setSuggestions([]);
    setHasSearched(false);
  };

  const submitToShop = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    closeOverlay();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-bg/[0.98] z-50 overflow-y-auto flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 md:py-8 flex justify-between items-center border-b border-brand-border">
        <form
          className="flex-1 max-w-2xl relative"
          onSubmit={(e) => {
            e.preventDefault();
            submitToShop(query);
          }}
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-taupe h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search fashion, fragrance, beauty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-brand-beige border border-brand-border rounded-full py-3 pl-12 pr-10 text-brand-charcoal placeholder-brand-taupe/70 font-sans focus:outline-none focus:border-brand-burgundy focus:ring-1 focus:ring-brand-burgundy text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-brand-taupe hover:text-brand-charcoal"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
        <button
          onClick={closeOverlay}
          className="ml-6 flex items-center gap-1 text-sm font-sans tracking-widest uppercase text-brand-charcoal hover:text-brand-burgundy font-medium group"
        >
          Close <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {query.trim().length === 0 ? (
          <div className="fade-in space-y-8">
            {recentSearches.length > 0 && (
              <div>
                <h3 className="font-serif text-lg text-brand-charcoal mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-taupe" /> Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="bg-white border border-brand-border hover:border-brand-taupe text-brand-charcoal px-5 py-2.5 rounded-full text-sm font-sans transition-colors duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-serif text-lg text-brand-charcoal mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="bg-brand-beige hover:bg-brand-border text-brand-charcoal px-5 py-2.5 rounded-full text-sm font-sans transition-colors duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg text-brand-charcoal">
                Suggestions for &ldquo;{query}&rdquo;
              </h3>
              <button
                onClick={() => submitToShop(query)}
                className="text-xs text-brand-burgundy hover:text-brand-charcoal font-sans font-bold uppercase tracking-wider inline-flex items-center gap-1"
              >
                View All Results <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-4 animate-pulse">
                    <div className="bg-brand-beige w-14 h-[70px] rounded flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-brand-beige rounded w-2/3 mb-2" />
                      <div className="h-3 bg-brand-beige rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="divide-y divide-brand-border/60 border border-brand-border/60 rounded-lg bg-white overflow-hidden">
                {suggestions.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/product/${s.slug}`}
                      onClick={closeOverlay}
                      className="flex items-center gap-4 p-3.5 hover:bg-brand-beige/40 transition-colors group"
                    >
                      <div className="relative w-14 h-[70px] bg-brand-beige rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={s.image ?? "/placeholder.jpg"}
                          alt={s.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm text-brand-charcoal truncate group-hover:text-brand-burgundy transition-colors">
                          {s.name}
                        </p>
                        <p className="font-sans text-[11px] text-brand-taupe uppercase tracking-wider">
                          {s.subcategory}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-sans text-sm font-bold text-brand-charcoal">
                          GH₵{s.price.toFixed(2)}
                        </p>
                        {s.originalPrice && (
                          <p className="font-sans text-[11px] text-brand-taupe line-through">
                            GH₵{s.originalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : hasSearched ? (
              <div className="text-center py-20 bg-brand-beige/30 rounded border border-dashed border-brand-border">
                <p className="font-serif text-lg text-brand-charcoal mb-2">No results found</p>
                <p className="font-sans text-sm text-brand-taupe max-w-sm mx-auto">
                  We couldn&rsquo;t find anything matching &ldquo;{query}&rdquo;. Try checking your spelling or searching for another term.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
