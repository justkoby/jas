"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  { src: "/image-11.jpg", alt: "JAS curated pieces" },
  { src: "/image-14.jpg", alt: "JAS lifestyle edit" },
  { src: "/image-12.jpg", alt: "JAS home and living details" },
];

/**
 * Crossfading slideshow for the "Curated For You" banner.
 * Images stack absolutely; the active one fades in over ~1s.
 */
export default function CuratedSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActive((prev) => (prev + 1) % slides.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
