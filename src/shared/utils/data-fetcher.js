import { createExerciseParser } from "./data-parser.js"

export const exerciseMarkdownFiles = import.meta.glob("../data/**/exercise.md", {
	query: "?raw",
	import: "default",
	eager: true,
})

const exerciseImages = import.meta.glob("../data/**/*.{png,jpg,jpeg,webp}", {
	import: "default",
	eager: true,
})

const parseExercise = createExerciseParser(exerciseImages)

export function getExerciseData(exerciseName) {
	const targetFilePath = `../data/${exerciseName}/exercise.md`
	const rawText = exerciseMarkdownFiles[targetFilePath]

	return parseExercise(exerciseName, rawText)
}
