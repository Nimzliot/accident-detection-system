/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        minor: "#22c55e",
        medium: "#facc15",
        severe: "#ef4444",
        base: "#08111f",
        panel: "#0f1c2f",
        line: "#233756",
        accent: "#4fd1c5"
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(79, 209, 197, 0.12), 0 24px 80px rgba(8, 17, 31, 0.45)"
      },
      keyframes: {
        pulseAlert: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.95" },
          "50%": { transform: "scale(1.02)", opacity: "1" }
        },
        riseIn: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      },
      animation: {
        "pulse-alert": "pulseAlert 1.8s ease-in-out infinite",
        "rise-in": "riseIn 0.5s ease-out forwards"
      }
    }
  },
  plugins: []
};
