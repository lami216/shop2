/** @type {import('tailwindcss').Config} */
export default {
        content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
        theme: {
                extend: {
                        colors: {
                                "kingdom-ivory": "#F7F4EF",
                                "kingdom-purple": "#3A1F4B",
                                "kingdom-plum": "#221228",
                                "kingdom-gold": "#D4AF37",
                                "kingdom-charcoal": "#1E1E1E",
                                "kingdom-muted": "#7A7278",
                                "kingdom-cream": "#F1ECE4",
                                "payzone-navy": "#3A1F4B",
                                "payzone-white": "#F7F4EF",
                                "payzone-gold": "#D4AF37",
                                "payzone-indigo": "#221228",
                        },
                        fontFamily: {
                                royal: ['"El Messiri"', '"Cairo"', "ui-sans-serif", "system-ui"],
                        },
                        boxShadow: {
                                "royal-soft": "0 20px 40px -20px rgba(58,31,75,0.45)",
                                "royal-glow": "0 15px 30px -12px rgba(212,175,55,0.4)",
                        },
                        transitionDuration: {
                                220: "220ms",
                        },
                        maxWidth: {
                                "8xl": "88rem",
                        },
                },
        },
        plugins: [],
};
