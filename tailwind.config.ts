// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Root level
    "./*.{js,ts,jsx,tsx,mdx}",
    
    // App directory (Next.js 13+)
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Pages directory (older Next.js)
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Components
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;