import "./styles.css"
import variationsTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"
import { exerciseImages } from "@shared/utils/data-fetcher"

function buildAvatarImages(exerciseIds, currentCategory) {
	if (!exerciseIds || !exerciseIds.length) return ""

	return exerciseIds
		.map((id) => {
			// Locate the avatar in the exerciseImages glob map
			const imageKey = Object.keys(exerciseImages).find((key) => key.endsWith(`/${id}/avatar.png`))

			let imgPath = ""
			let category = currentCategory

			if (imageKey) {
				imgPath = exerciseImages[imageKey]
				// Extract category name from key path: ../data/<category>/<id>/avatar.png
				const parts = imageKey.split("/")
				if (parts.length >= 4) {
					category = parts[parts.length - 3]
				}
			} else {
				// Fallback URL construct
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

export function renderVariations(attributes, category) {
	const regressions = attributes.regressions || []
	const progressions = attributes.progressions || []

	// if empty, remove the placeholder so it doesn't leave an empty gap
	if (!regressions.length && !progressions.length) {
		const placeholder = document.querySelector("#variations-placeholder")
		if (placeholder) placeholder.remove()
		return
	}

	queryReplace("#variations-placeholder", variationsTemplate)

	const variationsEl = document.querySelector("#exercise-window .content .variations")
	if (!variationsEl) return

	const regContainer = variationsEl.querySelector(".regressions")
	const progContainer = variationsEl.querySelector(".progressions")

	if (regressions.length) {
		regContainer.style.display = "flex"
		regContainer.querySelector(".avatars").innerHTML = buildAvatarImages(regressions, category)
	} else {
		regContainer.style.display = "none"
	}

	if (progressions.length) {
		progContainer.style.display = "flex"
		progContainer.querySelector(".avatars").innerHTML = buildAvatarImages(progressions, category)
	} else {
		progContainer.style.display = "none"
	}
}
