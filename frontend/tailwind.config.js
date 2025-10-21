import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				linkedin: {
					blue: '#0A66C2',
					'blue-dark': '#004182',
					'blue-light': '#70B5F9',
					gray: {
						50: '#F3F2EF',
						100: '#E7E5DF',
						200: '#DAD7D0',
						300: '#CEC9C1',
						400: '#B3B0A8',
						500: '#9AA0A6',
						600: '#6E6E6E',
						700: '#5E5E5E',
						800: '#4E4E4E',
						900: '#3E3E3E',
					},
					green: '#057642',
					red: '#CC1016',
					yellow: '#F5C75D',
				},
			},
			fontFamily: {
				sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				linkedin: {
					primary: "#0A66C2", // LinkedIn Blue
					secondary: "#FFFFFF", // White
					accent: "#7FC15E", // LinkedIn Green (for accents)
					neutral: "#000000", // Black (for text)
					"base-100": "#F3F2EF", // Light Gray (background)
					info: "#5E5E5E", // Dark Gray (for secondary text)
					success: "#057642", // Dark Green (for success messages)
					warning: "#F5C75D", // Yellow (for warnings)
					error: "#CC1016", // Red (for errors)
				},
			},
		],
	},
};
