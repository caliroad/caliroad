import { createExerciseParser } from "./data-parser"
import type { StringDictionary, ParsedExercise } from "@shared/types/exercise"

export const exerciseMarkdownFiles = import.meta.glob("../data/**/exercise.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as StringDictionary

export const exerciseImages = import.meta.glob("../data/**/*.{png,jpg,jpeg,webp}", {
	import: "default",
	eager: true,
}) as StringDictionary

const parseExercise = createExerciseParser(exerciseImages)

export function getExerciseData(exerciseName: string, categoryName?: string | null): ParsedExercise | null {
	let targetFilePath = ""
	let resolvedCategory = categoryName || undefined

	if (categoryName) {
		targetFilePath = `../data/${categoryName}/${exerciseName}/exercise.md`
	} else {
		// fallback: search across all category folders if category wasn't provided in route
		const foundPath = Object.keys(exerciseMarkdownFiles).find((filePath) =>
			filePath.endsWith(`/${exerciseName}/exercise.md`)
		)

		if (foundPath) {
			targetFilePath = foundPath
			const pathParts = foundPath.split("/")
			// extract category directory from path (../data/<category>/<exercise>/exercise.md)
			resolvedCategory = pathParts[pathParts.length - 3]
		}
	}

	const rawText = exerciseMarkdownFiles[targetFilePath] || ""
	if (!rawText) return null

	return parseExercise(exerciseName, rawText, resolvedCategory)
}
