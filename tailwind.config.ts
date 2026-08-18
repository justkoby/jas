import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          bg: "#FDFBF7",
          charcoal: "#121212",
          taupe: "#8C7A6B",
          beige: "#F5F2EB",
          border: "#EAE3D5",
          burgundy: "#9A3B5A",
          rose: "#C27D80",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(140, 122, 107, 0.08)',
        'card': '0 2px 12px rgba(140, 122, 107, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;
