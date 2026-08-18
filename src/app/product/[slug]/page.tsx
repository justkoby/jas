import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/services/products";
import ProductDetailClient from "@/components/storefront/ProductDetailClient";

// Product pages are cacheable briefly; stock changes propagate
// within a minute until revalidatePath hooks land with the admin.
export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product, 6);

  return <ProductDetailClient product={product} related={related} />;
}
