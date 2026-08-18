"use client";

import React, { useState, useEffect } from "react";

const announcements = [
  "Free delivery in Accra on orders above GH₵1,000",
  "Need it urgently? Select pickup and send your rider",
  "New styles and lifestyle essentials added weekly"
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-brand-burgundy text-brand-bg py-2 px-4 text-center text-xs font-sans tracking-wider uppercase transition-all duration-300">
      <div className="max-w-7xl mx-auto h-4 overflow-hidden relative">
        {announcements.map((announcement, index) => (
          <div
            key={index}
            className={`absolute w-full left-0 right-0 transition-all duration-500 transform ${
              index === currentIndex
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            {announcement}
          </div>
        ))}
      </div>
    </div>
  );
}
