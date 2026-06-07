import "./styles.css"
import musclesTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"

function makeList(className, title, items) {
	if (!items) return ""
	return `
      <div class="${className}">
        <h3>${title}</h3>
        <ul>
          ${items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    `
}

export function renderMuscles(data) {
	queryReplace("#muscles-placeholder", musclesTemplate)

	const contentMusclesEl = document.querySelector(".content .muscles")

	if (!contentMusclesEl) {
		console.warn("Muscles target container element not found in the DOM.")
		return
	}

	if (!data) return

	const primaryMuscles = makeList("primary-muscles", "Primary Muscles", data["primary-muscles"])
	const secondaryMuscles = makeList("secondary-muscles", "Secondary Muscles", data["secondary-muscles"])

	contentMusclesEl.innerHTML = primaryMuscles + secondaryMuscles
}
