import fm from "front-matter"
import { marked } from "marked"
import type { StringDictionary, ExerciseAttributes, ParsedExercise } from "@shared/types/exercise"

export type ExerciseParserFn = (
	exerciseName: string,
	rawMarkdownText: string,
	categoryName?: string
) => ParsedExercise | null

export function createExerciseParser(assetDictionary: StringDictionary | null = null): ExerciseParserFn {
	function getAsset(
		categoryName: string | undefined,
		exerciseName: string,
		fileName: string,
		defaultAsset: string
	): string {
		const expectedPath: string = categoryName
			? `../data/${categoryName}/${exerciseName}/${fileName}`
			: `../data/${exerciseName}/${fileName}`

		if (assetDictionary && assetDictionary[expectedPath]) {
			return assetDictionary[expectedPath]
		}

		return defaultAsset
	}

	return function parse(exerciseName: string, rawMarkdownText: string, categoryName?: string): ParsedExercise | null {
		if (!rawMarkdownText) return null

		const parsedFile = fm<ExerciseAttributes>(rawMarkdownText)
		const data: ExerciseAttributes = parsedFile.attributes
		const content: string = parsedFile.body

		return {
			name: exerciseName,
			category: categoryName,
			title: data.title || exerciseName,
			attributes: data,
			htmlContent: marked.parse(content) as string,
			assets: {
				bannerUrl: getAsset(categoryName, exerciseName, "banner.jpg", "/src/shared/assets/default_banner.jpg"),
				avatarUrl: getAsset(categoryName, exerciseName, "avatar.png", "/src/shared/assets/default_avatar.png"),
			},
		}
	}
}
