"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  { src: "/image-1.jpg", alt: "JAS editorial campaign" },
  { src: "/image-2.jpg", alt: "JAS seasonal collection" },
  { src: "/image-3.jpg", alt: "JAS curated lifestyle" },
  { src: "/image-4.jpg", alt: "JAS signature pieces" },
];

/**
 * Full-bleed hero background slideshow with a soft crossfade.
 * Images stack absolutely; the active one fades in over ~1s.
 */
export default function HeroSlideshow() {
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
          className={`object-cover object-[center_35%] filter brightness-[0.93] transition-opacity duration-1000 ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
