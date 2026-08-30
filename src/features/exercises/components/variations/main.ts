import "./styles.css"
import variationsTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"
import { exerciseImages } from "@shared/utils/data-fetcher"
import type { ExerciseAttributes } from "@shared/types/exercise"

function buildAvatarImages(exerciseIds: string[] | null | undefined, currentCategory?: string | null): string {
	if (!exerciseIds || !exerciseIds.length) return ""

	return exerciseIds
		.map((id: string) => {
			// locate the avatar in the exerciseImages glob map
			const imageKey = Object.keys(exerciseImages).find((key) => key.endsWith(`/${id}/avatar.png`))

			let imgPath = ""
			let category = currentCategory

			if (imageKey) {
				imgPath = exerciseImages[imageKey]
				// extract category name from key path: ../data/<category>/<id>/avatar.png
				const parts = imageKey.split("/")
				if (parts.length >= 4) {
					category = parts[parts.length - 3]
				}
			} else {
				// fallback URL construct
				const categoryPath = currentCategory ? `${currentCategory}/` : ""
				imgPath = new URL(`/shared/data/${categoryPath}${id}/avatar.png`, import.meta.url).href
			}

			const href = category ? `#/${category}/${id}` : `#/${id}`

			return `
            <a href="${href}" class="avatar-link">
                <img class="avatar" src="${imgPath}" alt="${id}" title="${id}" data-id="${id}" />
            </a>
        `
		})
		.join("")
}

export function renderVariations(attributes: Partial<ExerciseAttributes>, category?: string | null): void {
	const regressions: string[] = (attributes.regressions as string[]) || []
	const progressions: string[] = (attributes.progressions as string[]) || []

	// if empty, remove the placeholder so it doesn't leave an empty gap
	if (!regressions.length && !progressions.length) {
		const placeholder = document.querySelector<HTMLElement>("#variations-placeholder")
		if (placeholder) placeholder.remove()
		return
	}

	queryReplace("#variations-placeholder", variationsTemplate)

	const variationsEl = document.querySelector<HTMLElement>("#exercise-window .content .variations")
	if (!variationsEl) return

	const regContainer = variationsEl.querySelector<HTMLElement>(".regressions")
	const progContainer = variationsEl.querySelector<HTMLElement>(".progressions")

	if (regContainer) {
		if (regressions.length) {
			regContainer.style.display = "flex"
			const avatarsEl = regContainer.querySelector<HTMLElement>(".avatars")
			if (avatarsEl) avatarsEl.innerHTML = buildAvatarImages(regressions, category)
		} else {
			regContainer.style.display = "none"
		}
	}

	if (progContainer) {
		if (progressions.length) {
			progContainer.style.display = "flex"
			const avatarsEl = progContainer.querySelector<HTMLElement>(".avatars")
			if (avatarsEl) avatarsEl.innerHTML = buildAvatarImages(progressions, category)
		} else {
			progContainer.style.display = "none"
		}
	}
}
