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

			// resolve path to 'shared/data' relative to this build file
			const dataDir = path.resolve(__dirname, "../../../shared/data")

			if (!fs.existsSync(dataDir)) {
				return `export default { nodes: [], links: [] }`
			}

			const exerciseFolders = fs
				.readdirSync(dataDir)
				.filter((f) => fs.statSync(path.join(dataDir, f)).isDirectory())

			const buildTimeAssetDictionary = {}

			for (const exercise of exerciseFolders) {
				const avatarPath = path.join(dataDir, exercise, "avatar.png")
				if (fs.existsSync(avatarPath)) {
					buildTimeAssetDictionary[`../data/${exercise}/avatar.png`] = `/shared/data/${exercise}/avatar.png`
				}

				const bannerPath = path.join(dataDir, exercise, "banner.jpg")
				if (fs.existsSync(bannerPath)) {
					buildTimeAssetDictionary[`../data/${exercise}/banner.jpg`] = `/shared/data/${exercise}/banner.jpg`
				}
			}

			const parseExercise = createExerciseParser(buildTimeAssetDictionary)

			let graphData = {
				nodes: [],
				links: [],
			}
			const seenLinks = new Set()

			for (const exercise of exerciseFolders) {
				const mdPath = path.join(dataDir, exercise, "exercise.md")
				if (!fs.existsSync(mdPath)) continue

				const rawText = fs.readFileSync(mdPath, "utf-8")
				const exerciseData = parseExercise(exercise, rawText)
				if (!exerciseData) continue

				graphData.nodes.push({
					id: exerciseData.name,
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
