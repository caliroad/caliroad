import fm from "front-matter"
import { marked } from "marked"

export function createExerciseParser(assetDictionary = null) {
	function getAsset(exerciseName, fileName, defaultAsset) {
		const expectedPath = `../data/${exerciseName}/${fileName}`
		if (assetDictionary && assetDictionary[expectedPath]) {
			return assetDictionary[expectedPath]
		}
		return defaultAsset
	}

	return function parse(exerciseName, rawMarkdownText) {
		if (!rawMarkdownText) return null

		const parsedFile = fm(rawMarkdownText)
		const data = parsedFile.attributes
		const content = parsedFile.body

		return {
			name: exerciseName,
			title: data.title || exerciseName,
			attributes: data,
			htmlContent: marked.parse(content),
			assets: {
				bannerUrl: getAsset(exerciseName, "banner.jpg", "/src/shared/assets/default_banner.jpg"),
				avatarUrl: getAsset(exerciseName, "avatar.png", "/src/shared/assets/default_avatar.png"),
			},
		}
	}
}
