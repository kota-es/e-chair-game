import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "shock-vibrate": "shock-vibrate 0.5s linear  infinite both",
      },
      keyframes: {
        "shock-vibrate": {
          "0%,to": {
            transform: "translate(0)",
          },
          "10%,50%,80%": {
            transform: "translate(-20px, -20px)",
          },
          "20%,60%,90%": {
            transform: "translate(20px, -20px)",
          },
          "30%,70%": {
            transform: "translate(-20px, 20px)",
          },
          "40%": {
            transform: "translate(20px, 20px)",
          },
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
