import fm from "front-matter"
import { marked } from "marked"

// ################ Vite Build-Time Bundling
// Bundle all exercise text and images into these objects
const exerciseMarkdownFiles = import.meta.glob("../data/**/exercise.md", {
	query: "?raw",
	import: "default",
	eager: true,
})

const exerciseImages = import.meta.glob("../data/**/*.{png,jpg,jpeg,webp}", {
	import: "default",
	eager: true,
})

export function getExerciseAsset(exerciseName, fileName, defaultAsset) {
	const expectedPath = `../data/${exerciseName}/${fileName}`
	return exerciseImages[expectedPath] ? exerciseImages[expectedPath] : defaultAsset
}

export function getExerciseData(exerciseName) {
	const targetFilePath = `../data/${exerciseName}/exercise.md`
	const exerciseText = exerciseMarkdownFiles[targetFilePath]

	if (!exerciseText) return null

	const parsedFile = fm(exerciseText)
	const data = parsedFile.attributes
	const content = parsedFile.body

	return {
		name: exerciseName,
		title: data.title || exerciseName,
		attributes: data,
		htmlContent: marked.parse(content),
		assets: {
			bannerUrl: getExerciseAsset(exerciseName, "banner.jpg", "/src/shared/assets/default_banner.jpg"),
			avatarUrl: getExerciseAsset(exerciseName, "avatar.png", "/src/shared/assets/default_avatar.png"),
		},
	}
}
