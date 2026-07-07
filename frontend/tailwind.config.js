/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef6ff",
          100: "#d8eaff",
          200: "#b9d7ff",
          500: "#2f76d2",
          700: "#164f9c",
          900: "#07182f"
        },
        ink: "#101828"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
};
