import "./styles.css"
import musclesTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"

import { renderMusclesDiagram } from "@features/muscles-diagram/main"

function populateList(container, items) {
	if (!container) return

	const section = container.closest("div")

	// hide the section if there are no items for this category
	if (!items || items.length === 0) {
		if (section) section.style.display = "none"
		container.innerHTML = ""
		return
	}

	if (section) section.style.display = ""
	container.innerHTML = items.map((item) => `<li>${item}</li>`).join("")
}

export function renderMuscles(data) {
	queryReplace("#muscles-placeholder", musclesTemplate)
	renderMusclesDiagram("#muscles-diagram-placeholder")

	const rootEl = document.querySelector(".content .muscles")

	if (!rootEl) {
		console.warn("Muscles target container element not found in the DOM.")
		return
	}

	if (!data) return

	const primaryList = rootEl.querySelector(".text-chart .primary-list")
	const secondaryList = rootEl.querySelector(".text-chart .secondary-list")

	populateList(primaryList, data["primary-muscles"])
	populateList(secondaryList, data["secondary-muscles"])
}
