import type { Config } from "tailwindcss";

/**
 * Fellowship palette from the coastal editorial brief and the program deck.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#112B3C",
        teal: "#4A6290",
        ivory: "#F7F0E3",
        coral: "#FE7272",
        gold: "#FDC469",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
