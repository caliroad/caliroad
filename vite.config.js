import { defineConfig } from "vite"
import buildGraphDataPlugin from "./src/features/force-graph/build/vite-plugin-graph-data"
import i18nAutoScopePlugin from "./src/app/components/localization/build/vite-plugin-i18n-auto-scope"
import path from "path"

export default defineConfig({
	root: "./src",

	base: process.env.GITHUB_ACTIONS ? "/caliroad/" : "/",

	publicDir: "../public",

	server: {
		open: true,
	},

	build: {
		outDir: "../dist",
		emptyOutDir: true,
	},

	plugins: [buildGraphDataPlugin(), i18nAutoScopePlugin()],

	resolve: {
		alias: {
			"@app": path.resolve(__dirname, "./src/app"), // New App Alias
			"@features": path.resolve(__dirname, "./src/features"),
			"@shared": path.resolve(__dirname, "./src/shared"),
		},
	},
})
