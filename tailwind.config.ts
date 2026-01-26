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
    extend: {
      animation: {
        rotate: 'rotate 4s ease-in-out infinite',
      },
      keyframes: {
        rotate: {
          '0%': { transform: 'rotate(70deg)' },
          '50%': { transform: 'rotate(100deg)' },
          '100%': { transform: 'rotate(70deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;