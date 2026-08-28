export type StringDictionary = Record<string, string>

export interface ExerciseAttributes {
	title?: string
	[key: string]: unknown
}

export interface ExerciseAssets {
	bannerUrl: string
	avatarUrl: string
}

export interface ParsedExercise {
	name: string
	category: string
	title: string
	attributes: ExerciseAttributes
	htmlContent: string
	assets: ExerciseAssets
}
