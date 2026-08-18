"use client";

import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useUI } from "@/context/UIContext";

export default function ToastNotification() {
  const { toast } = useUI();

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn bg-white rounded-lg shadow-soft border border-brand-border p-4 max-w-sm flex items-start gap-3 w-full">
      {toast.type === "success" ? (
        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-5 w-5 text-brand-burgundy flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className="font-sans text-xs font-semibold text-brand-charcoal">
          {toast.type === "success" ? "Success" : "Notification"}
        </p>
        <p className="font-sans text-xs text-brand-taupe mt-0.5 leading-relaxed">
          {toast.message}
        </p>
      </div>
    </div>
  );
}
