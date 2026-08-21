import fm from "front-matter"
import { marked } from "marked"
import type { StringDictionary, ExerciseAttributes, ParsedExercise } from "@shared/types/exercise"

export type ExerciseParserFn = (exerciseName: string, rawMarkdownText: string) => ParsedExercise | null

export function createExerciseParser(assetDictionary: StringDictionary | null = null): ExerciseParserFn {
	function getAsset(exerciseName: string, fileName: string, defaultAsset: string): string {
		const expectedPath: string = `../data/${exerciseName}/${fileName}`

		if (assetDictionary && assetDictionary[expectedPath]) {
			return assetDictionary[expectedPath]
		}

		return defaultAsset
	}

	return function parse(exerciseName: string, rawMarkdownText: string): ParsedExercise | null {
		if (!rawMarkdownText) return null

		const parsedFile = fm<ExerciseAttributes>(rawMarkdownText)
		const data: ExerciseAttributes = parsedFile.attributes
		const content: string = parsedFile.body

		return {
			name: exerciseName,
			title: data.title || exerciseName,
			attributes: data,
			htmlContent: marked.parse(content) as string,
			assets: {
				bannerUrl: getAsset(exerciseName, "banner.jpg", "/src/shared/assets/default_banner.jpg"),
				avatarUrl: getAsset(exerciseName, "avatar.png", "/src/shared/assets/default_avatar.png"),
			},
		}
	}
}
