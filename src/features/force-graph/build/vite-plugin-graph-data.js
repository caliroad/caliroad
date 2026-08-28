import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createExerciseParser } from "../../../../src/shared/utils/data-parser.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function buildGraphDataPlugin() {
	const virtualModuleId = "virtual:graph-data"
	const resolvedVirtualModuleId = "\0" + virtualModuleId

	return {
		name: "vite-plugin-graph-data",

		resolveId(id) {
			if (id === virtualModuleId) return resolvedVirtualModuleId
		},
		load(id) {
			if (id !== resolvedVirtualModuleId) return

			const dataDir = path.resolve(__dirname, "../../../shared/data")

			if (!fs.existsSync(dataDir)) {
				return `export default { nodes: [], links: [] }`
			}

			// 1. Read category directories (e.g., calisthenics)
			const categories = fs
				.readdirSync(dataDir)
				.filter((item) => fs.statSync(path.join(dataDir, item)).isDirectory())

			const buildTimeAssetDictionary = {}
			const exerciseEntries = [] // Array of { category, exercise }

			// 2. Discover exercise directories within each category
			for (const category of categories) {
				const categoryPath = path.join(dataDir, category)
				const exercises = fs
					.readdirSync(categoryPath)
					.filter((item) => fs.statSync(path.join(categoryPath, item)).isDirectory())

				for (const exercise of exercises) {
					exerciseEntries.push({ category, exercise })

					const avatarPath = path.join(categoryPath, exercise, "avatar.png")
					if (fs.existsSync(avatarPath)) {
						buildTimeAssetDictionary[`../data/${category}/${exercise}/avatar.png`] =
							`/shared/data/${category}/${exercise}/avatar.png`
					}

					const bannerPath = path.join(categoryPath, exercise, "banner.jpg")
					if (fs.existsSync(bannerPath)) {
						buildTimeAssetDictionary[`../data/${category}/${exercise}/banner.jpg`] =
							`/shared/data/${category}/${exercise}/banner.jpg`
					}
				}
			}

			const parseExercise = createExerciseParser(buildTimeAssetDictionary)

			let graphData = {
				nodes: [],
				links: [],
			}
			const seenLinks = new Set()

			// 3. Parse Markdown files using the category path
			for (const { category, exercise } of exerciseEntries) {
				const mdPath = path.join(dataDir, category, exercise, "exercise.md")
				if (!fs.existsSync(mdPath)) continue

				const rawText = fs.readFileSync(mdPath, "utf-8")
				const exerciseData = parseExercise(exercise, rawText, category)
				if (!exerciseData) continue

				graphData.nodes.push({
					id: exerciseData.name,
					category: category,
					img: exerciseData.assets.avatarUrl,
				})

				const variations = [
					...(exerciseData.attributes?.progressions || []),
					...(exerciseData.attributes?.regressions || []),
				]

				for (const variation of variations) {
					const linkFingerprint = [exerciseData.name, variation].sort().join("::")

					if (seenLinks.has(linkFingerprint)) continue
					seenLinks.add(linkFingerprint)

					graphData.links.push({
						source: exerciseData.name,
						target: variation,
					})
				}
			}

			return `export default ${JSON.stringify(graphData)}`
		},
	}
}
