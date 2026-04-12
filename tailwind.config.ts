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
        // Strixhaven palette
        "bg-void": "#050505",
        "gold-accent": "#4d6393",
        "silverquill-ink": "#3a3a3a",
      },
    },
  },
  plugins: [],
};
export default config;
