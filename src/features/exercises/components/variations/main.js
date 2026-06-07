import "./styles.css"
import variationsTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"

function buildAvatarImages(exerciseIds) {
	if (!exerciseIds || !exerciseIds.length) return ""

	return exerciseIds
		.map((id) => {
			const imgPath = new URL(`../../data/${id}/avatar.png`, import.meta.url).href

			return `
            <a href="#${id}" class="avatar-link">
                <img class="avatar" src="${imgPath}" alt="${id}" title="${id}" data-id="${id}" />
            </a>
        `
		})
		.join("")
}

export function renderVariations(attributes) {
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
		regContainer.querySelector(".avatars").innerHTML = buildAvatarImages(regressions)
	} else {
		regContainer.style.display = "none"
	}

	if (progressions.length) {
		progContainer.style.display = "flex"
		progContainer.querySelector(".avatars").innerHTML = buildAvatarImages(progressions)
	} else {
		progContainer.style.display = "none"
	}
}
