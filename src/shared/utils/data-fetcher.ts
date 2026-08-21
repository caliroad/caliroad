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

export function getExerciseData(exerciseName: string): ParsedExercise | null {
	const targetFilePath = `../data/${exerciseName}/exercise.md`
	const rawText = exerciseMarkdownFiles[targetFilePath] || ""

	return parseExercise(exerciseName, rawText)
}
