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
        "shock-vibrate": "shock-vibrate 0.25s linear infinite both",
        "flip-in-ver-right":
          "flip-in-ver-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940)  both",
      },
      keyframes: {
        "shock-vibrate": {
          "0%,to": {
            transform: "translate(0)",
          },
          "10%,50%,80%": {
            transform: "translate(-60px, -30px)",
          },
          "20%,60%,90%": {
            transform: "translate(30px, -60px)",
          },
          "30%,70%": {
            transform: "translate(-60px, 30px)",
          },
          "40%": {
            transform: "translate(30px, 60px)",
          },
        },
        "flip-in-ver-right": {
          "0%": {
            transform: "rotateY(-80deg)",
            opacity: "0",
          },
          to: {
            transform: "rotateY(0)",
            opacity: "1",
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
