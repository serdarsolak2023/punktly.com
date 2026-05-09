
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: { soft: "0 18px 45px rgba(30, 64, 175, 0.14)", coin: "0 10px 20px rgba(245, 158, 11, .35)" },
      animation: {
        floaty: "floaty 3s ease-in-out infinite",
        pop: "pop .35s ease-out",
        coin: "coin .9s ease-out",
        shine: "shine 2.8s linear infinite"
      },
      keyframes: {
        floaty: {"0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" }},
        pop: {"0%": { transform: "scale(.86)", opacity: ".25" }, "100%": { transform: "scale(1)", opacity: "1" }},
        coin: {"0%": { transform: "translateY(20px) scale(.55)", opacity: "0" }, "55%": { transform: "translateY(-14px) scale(1.12)", opacity: "1" }, "100%": { transform: "translateY(-38px) scale(.9)", opacity: "0" }},
        shine: {"0%": { transform: "translateX(-120%) rotate(12deg)" }, "100%": { transform: "translateX(160%) rotate(12deg)" }}
      }
    }
  },
  plugins: []
};
export default config;
