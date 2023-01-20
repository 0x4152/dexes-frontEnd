/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            backgroundImage: {
                back: "url('../public/bg.jpg')",
            },
            fontFamily: {
                sans: ["ui-sans-serif", "system-ui"],
            },
        },
    },
    plugins: [],
}
