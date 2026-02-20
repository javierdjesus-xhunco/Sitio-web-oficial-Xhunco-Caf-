import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#31572c",      // Hunter Green
          greenHover: "#3f6b38", // Hover (ligeramente más claro)
        },
      },
    },
  },
  plugins: [],
};

export default config;
