/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

    theme: {
        extend: {
            colors: {
                primary: "#293751",
                primaryred: "#47B2E4",
                "custom-dark": "rgb(32, 30, 30)",
            },
            fontFamily: {
                chivo: ["Chivo", "sans-serif"],
                poppins: ["Poppins", "sans-serif"],
                roboto: ["Roboto", "sans-serif"],
                ubuntu: ["Ubuntu", "sans-serif"],
            },
            animation: {
                spinScale: "spinScale 2s ease-in-out infinite",
            },
            keyframes: {
                spinScale: {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.5)" },
                },
            },
        },
    },
    // eslint-disable-next-line no-undef
    plugins: [require("daisyui")],
    daisyui: {
        themes: [{
            light: {
                primary: "#014e4e", // Fixed color code
                secondary: "#22d3ee",
                accent: "#facc15",
                neutral: "#3d4451",
                "base-100": "#ffffff",
                info: "#3abff8",
                success: "#36d399",
            },
        }, ],
        darkTheme: "light",
    },
};