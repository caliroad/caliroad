import { defineConfig } from "vite"
import buildGraphDataPlugin from "./src/features/force-graph/build/vite-plugin-graph-data"
import path from "path"

export default defineConfig({
	root: "./src",

	server: {
		open: true,
	},

	build: {
		outDir: "../dist",
		emptyOutDir: true,
	},

	plugins: [buildGraphDataPlugin()],

	resolve: {
		alias: {
			"@app": path.resolve(__dirname, "./src/app"), // New App Alias
			"@features": path.resolve(__dirname, "./src/features"),
			"@shared": path.resolve(__dirname, "./src/shared"),
		},
	},
})
