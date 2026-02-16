import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f7f7f8",
          dark: "#212121",
        },
        border: {
          light: "#e5e5e5",
          dark: "#2f2f2f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
