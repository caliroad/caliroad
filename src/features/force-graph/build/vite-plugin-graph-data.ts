// @ts-ignore
import fs from "fs"
// @ts-ignore
import path from "path"
// @ts-ignore
import { fileURLToPath } from "url"
import { createExerciseParser } from "../../../../src/shared/utils/data-parser.js"
import type { Plugin } from "vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface GraphNode {
	id: string
	category: string
	img: string
}

interface GraphLink {
	source: string
	target: string
}

interface GraphData {
	nodes: GraphNode[]
	links: GraphLink[]
}

interface ExerciseEntry {
	category: string
	exercise: string
}

type AssetDictionary = Record<string, string>

export default function buildGraphDataPlugin(): Plugin {
	const virtualModuleId = "virtual:graph-data"
	const resolvedVirtualModuleId = "\0" + virtualModuleId

	return {
		name: "vite-plugin-graph-data",

		resolveId(id: string): string | undefined {
			if (id === virtualModuleId) return resolvedVirtualModuleId
		},

		load(id: string): string | undefined {
			if (id !== resolvedVirtualModuleId) return

			const dataDir = path.resolve(__dirname, "../../../shared/data")

			if (!fs.existsSync(dataDir)) {
				return `export default { nodes: [], links: [] }`
			}

			// 1. Read category directories (e.g., calisthenics)
			const categories: string[] = fs
				.readdirSync(dataDir)
				.filter((item: string) => fs.statSync(path.join(dataDir, item)).isDirectory())

			const buildTimeAssetDictionary: AssetDictionary = {}
			const exerciseEntries: ExerciseEntry[] = []

			// 2. Discover exercise directories within each category
			for (const category of categories) {
				const categoryPath = path.join(dataDir, category)
				const exercises: string[] = fs
					.readdirSync(categoryPath)
					.filter((item: string) => fs.statSync(path.join(categoryPath, item)).isDirectory())

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

			const graphData: GraphData = {
				nodes: [],
				links: [],
			}

			const seenLinks = new Set<string>()

			// 3. Parse Markdown files using the category path
			for (const { category, exercise } of exerciseEntries) {
				const mdPath = path.join(dataDir, category, exercise, "exercise.md")
				if (!fs.existsSync(mdPath)) continue

				const rawText = fs.readFileSync(mdPath, "utf-8")
				const exerciseData = parseExercise(exercise, rawText, category)
				if (!exerciseData) continue

				graphData.nodes.push({
					id: exerciseData.name,
					category,
					img: exerciseData.assets.avatarUrl,
				})

				const variations: string[] = [
					 ...((exerciseData.attributes?.progressions as string[]) ?? []),
					 ...((exerciseData.attributes?.regressions as string[]) ?? []),
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
