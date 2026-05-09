import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        punktly: {
          cream: "#FFF7E8",
          mint: "#BFEAD7",
          coral: "#FF8A7A",
          blue: "#81B7FF",
          ink: "#293241"
        }
      },
      boxShadow: {
        soft: "0 20px 50px rgba(41, 50, 65, 0.12)"
      }
    }
  },
  plugins: []
};
export default config;
