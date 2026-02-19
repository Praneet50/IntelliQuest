import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",
        secondary: "#a78bfa",
        dark: "#1a1a2e",
        darker: "#16162a",
        darkest: "#0f0f1e",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#7c3aed",
          secondary: "#a78bfa",
          accent: "#8b5cf6",
          neutral: "#1a1a2e",
          "base-100": "#1a1a2e",
          "base-200": "#16162a",
          "base-300": "#0f0f1e",
        },
      },
    ],
  },
};
