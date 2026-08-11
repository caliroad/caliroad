import path from "path"

export default function i18nAutoScopePlugin() {
	let rootDir = ""

	return {
		name: "vite-plugin-i18n-auto-scope",
		enforce: "pre", // runs before Vite's raw/HTML plugins

		configResolved(config) {
			rootDir = config.root
		},

		transform(code, id) {
			// normalize Windows backslashes and strip query parameters (?raw, ?url)
			const cleanId = id.replace(/\\/g, "/").split("?")[0]

			if (cleanId.endsWith(".html")) {
				const relativePath = path.relative(rootDir, cleanId).replace(/\\/g, "/")

				// skip root index.html
				if (!relativePath.includes("/")) return

				// e.g., "features/exercises/components/variations/template.html"
				//    -> "features.exercises.components.variations"
				const folderPath = relativePath.substring(0, relativePath.lastIndexOf("/"))
				const scope = folderPath.replace(/\//g, ".")

				let replaceCount = 0

				// matches data-i18n="key", data-i18n='key', data-i18n = "key", and escaped quotes
				const transformed = code.replace(/data-i18n\s*=\s*(\\?["'])(.*?)\1/g, (match, quote, value) => {
					// extract target attribute prefix if present (e.g., "[placeholder]search")
					const prefixMatch = value.match(/^(\[[^\]]+\])(.*)$/)
					const prefix = prefixMatch ? prefixMatch[1] : ""
					const rawKey = prefixMatch ? prefixMatch[2] : value

					replaceCount++
					return `data-i18n=${quote}${prefix}${scope}.${rawKey}${quote}`
				})

				return { code: transformed }
			}
		},
	}
}
