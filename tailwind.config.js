/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,svelte,vue,js,ts,jsx,tsx}"],
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        sc2: {
          primary: "#facc15",
          secondary: "#22c55e",
          accent: "#9333ea",
          neutral: "#1f2937",
          "base-100": "#171717",
          info: "#3b82f6",
          success: "#22c55e",
          warning: "#f97316",
          error: "#DC2828",
        },
      },
    ],
  },
};
