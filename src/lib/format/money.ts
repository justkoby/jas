/**
 * Money helpers. The database stores integer Ghana PESEWAS
 * (GH₵250.00 = 25000) to avoid floating-point drift; the
 * storefront UI still works with GHS floats.
 */

export function ghsToPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}

export function pesewasToGhs(pesewas: number): number {
  return pesewas / 100;
}

/** Formats a GHS amount like the existing storefront: "GH₵650.00". */
export function formatGhs(ghs: number): string {
  return `GH₵${ghs.toFixed(2)}`;
}

/** Formats pesewas directly for display. */
export function formatPesewas(pesewas: number): string {
  return formatGhs(pesewasToGhs(pesewas));
}
