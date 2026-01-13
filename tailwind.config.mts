import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "retro-sm": "2px 2px 0px 0px rgba(0,0,0,0.5)",
        retro: "4px 4px 0px 0px rgba(0,0,0,0.5)",
        "retro-lg": "6px 6px 0px 0px rgba(0,0,0,0.5)",
        "retro-inset": "inset 2px 2px 0px 0px rgba(0,0,0,0.3)",
      },
      textShadow: {
        sm: "1px 1px 0px rgba(0,0,0,1)",
        DEFAULT: "2px 2px 0px rgba(0,0,0,1)",
        lg: "3px 3px 0px rgba(0,0,0,1)",
      },
      colors: {
        jungle: {
          900: "#051F10", // Deepest background
          800: "#0A2818", // Standard background
          700: "#133D26", // Surface/Card
          600: "#1E5236", // Highlight
          500: "#2E7D32", // Primary Green
        },
        wood: {
          dark: "#3E2723",
          DEFAULT: "#5D4037",
          light: "#8D6E63",
          border: "#281815",
        },
        survivor: {
          gold: "#FFD700",
          warning: "#FFAB00",
          alert: "#FF3D00",
          terminal: "#33FF00",
          paper: "#F4EBD0", // For text on wood
        },
      },
      animation: {
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "text-shadow": (value: string) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    },
  ],
};
export default config;
