import "./styles.css"
import template from "./template.html?raw"

function savePreferences(value) {
	let savePreferences = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		localStorage.setItem("savedBackgroundAnimationState", value)
	}
}

export const backgroundAnimationToggleConfig = {
	template: template,
	init: (container) => {
		const toggle = container.querySelector("#background-animation-toggle input")
		const meshBackground = document.querySelector(".mesh-background")

		toggle.addEventListener("change", () => {
			savePreferences(toggle.checked)

			window.dispatchEvent(
				new CustomEvent("background-animation-change", {
					detail: {
						isAnimationOn: !toggle.checked,
					},
				})
			)
		})

		function syncUI() {
			toggle.checked = !meshBackground.classList.contains("paused")
		}

		syncUI()
		window.addEventListener("save-preferences-change", () => savePreferences(toggle.checked))
	},
}
