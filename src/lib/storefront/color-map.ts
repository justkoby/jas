/**
 * Colour swatch hex values. The database only stores colour
 * value strings, so swatch colours are resolved client-side
 * from this map (derived from the mock catalogue). Unknown
 * colours fall back to a neutral stone tone.
 */

import { mockProducts } from "@/data/products";

const FALLBACK_HEX = "#A8A29E";

export const COLOR_HEX_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const product of mockProducts) {
    for (const color of product.colors) {
      map[color.name.toLowerCase()] = color.value;
    }
  }
  return map;
})();

/** Resolves a colour name to its swatch hex (case-insensitive). */
export function colorHex(name: string): string {
  return COLOR_HEX_MAP[name.trim().toLowerCase()] ?? FALLBACK_HEX;
}
