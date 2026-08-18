"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  productName?: string;
  sku?: string;
}

export default function WhatsAppButton({ productName, sku }: WhatsAppButtonProps) {
  const phoneNumber = "233500000000"; // Ghanaian phone number placeholder
  
  const getWhatsAppLink = () => {
    let message = "Hi JAS, I am browsing your online store and would like to make an enquiry.";
    if (productName) {
      message = `Hi JAS, I am interested in purchasing "${productName}"${sku ? ` (SKU: ${sku})` : ""}. Is it available?`;
    }
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 hover:scale-105 flex items-center justify-center group"
      aria-label="Enquire on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-current" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out font-sans text-xs font-bold uppercase tracking-wider pl-0 group-hover:pl-2 whitespace-nowrap">
        Enquire
      </span>
    </a>
  );
}
