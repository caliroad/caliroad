import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
	root: "./src",

	build: {
		outDir: "../dist",
		emptyOutDir: true,
	},

	resolve: {
		alias: {
			"@app": path.resolve(__dirname, "./src/app"), // New App Alias
			"@features": path.resolve(__dirname, "./src/features"),
			"@shared": path.resolve(__dirname, "./src/shared"),
		},
	},
})
