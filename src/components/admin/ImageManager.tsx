"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { publicStorageUrl } from "@/lib/supabase/config";
import type { DbProductImage } from "@/types/database";
import { btnSecondary } from "@/components/admin/ui";

/**
 * Product image uploads straight to the `product-images` storage
 * bucket from the browser (staff-only via RLS storage policies),
 * then records the path in `product_images`.
 */

const BUCKET = "product-images";

function safeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function ImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: DbProductImage[];
}) {
  const [images, setImages] = useState<DbProductImage[]>(initialImages);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const added: DbProductImage[] = [];

    for (const file of Array.from(files)) {
      const path = `products/${productId}/${Date.now()}-${safeFileName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        continue;
      }

      const hasPrimary = images.some((i) => i.is_primary) || added.some((i) => i.is_primary);
      const { data: row, error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          storage_path: path,
          alt_text: file.name,
          display_order: images.length + added.length,
          is_primary: !hasPrimary,
        })
        .select("id, storage_path, alt_text, is_primary, display_order")
        .single();

      if (insertError || !row) {
        setError(`Could not save the image record: ${insertError?.message}`);
        continue;
      }
      added.push(row);
    }

    if (added.length > 0) {
      setImages((prev) => [...prev, ...added]);
      setMessage(`${added.length} image${added.length === 1 ? "" : "s"} uploaded.`);
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function handleDelete(image: DbProductImage) {
    startTransition(async () => {
      setError(null);
      const supabase = createClient();

      const { error: rowError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", image.id);
      if (rowError) {
        setError(rowError.message);
        return;
      }
      if (image.storage_path) {
        await supabase.storage.from(BUCKET).remove([image.storage_path]);
      }
      setImages((prev) => prev.filter((i) => i.id !== image.id));
      setMessage("Image removed.");
    });
  }

  function handleMakePrimary(image: DbProductImage) {
    startTransition(async () => {
      setError(null);
      const supabase = createClient();

      const { error: clearError } = await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId)
        .eq("is_primary", true);
      if (clearError) {
        setError(clearError.message);
        return;
      }
      const { error: setError_ } = await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", image.id);
      if (setError_) {
        setError(setError_.message);
        return;
      }
      setImages((prev) =>
        prev.map((i) => ({ ...i, is_primary: i.id === image.id }))
      );
      setMessage("Primary image updated.");
    });
  }

  return (
    <section className="bg-white border border-brand-border rounded-lg shadow-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
          Images
        </h2>
        <label className={btnSecondary}>
          {isPending ? "Working…" : "Upload images"}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={isPending}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      {message ? (
        <p className="font-sans text-xs text-emerald-700 mb-3">{message}</p>
      ) : null}
      {error ? (
        <p className="font-sans text-xs text-red-700 mb-3">{error}</p>
      ) : null}

      {images.length === 0 ? (
        <p className="font-sans text-sm text-brand-taupe">
          No images yet — the storefront shows a placeholder until you upload some.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative border border-brand-border rounded-md overflow-hidden bg-brand-beige"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  image.storage_path
                    ? publicStorageUrl(BUCKET, image.storage_path)
                    : "/placeholder.jpg"
                }
                alt={image.alt_text ?? "Product image"}
                className="aspect-square w-full object-cover"
              />
              {image.is_primary ? (
                <span className="absolute top-2 left-2 rounded-full bg-brand-burgundy px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-white">
                  Primary
                </span>
              ) : null}
              <div className="flex gap-2 p-2">
                {!image.is_primary ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleMakePrimary(image)}
                    className="flex-1 rounded border border-brand-border px-2 py-1 font-sans text-[10px] font-semibold text-brand-charcoal hover:bg-brand-beige disabled:opacity-50"
                  >
                    Make primary
                  </button>
                ) : (
                  <span className="flex-1" />
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(image)}
                  className="rounded border border-red-200 px-2 py-1 font-sans text-[10px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
