/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sora)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        hand: ["var(--font-caveat)", "cursive"],
        mono: ["var(--font-ibm-plex-mono)", "Menlo", "Monaco", "Courier New", "monospace"],
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },
    },
  },
  plugins: [],
};
