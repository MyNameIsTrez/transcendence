/** @type {import('tailwindcss').Config} */
module.exports = {
	purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	content: ['./**/*.{vue,js,ts,html}'],
	theme: {
		extend: {},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["dracula", "cyberpunk", "dark", "night", "retro", "lofi", "dim", "halloween", "lemonade"],
	},
}
