import "./styles.css"
import template from "./template.html?raw"

export const fullscreenToggleConfig = {
	template: template,
	init: (container) => {
		const toggle = container.querySelector("#fullscreen-toggle input")

		toggle.addEventListener("change", () => {
			let isChecked = toggle.checked

			if (isChecked) {
				document.documentElement
					.requestFullscreen()
					.catch((err) => alert(`Error enabling fullscreen: ${err.message}`))
			} else {
				if (document.fullscreenElement) {
					document.exitFullscreen()
				}
			}
		})

		function syncUI() {
			toggle.checked = document.fullscreenElement !== null
		}

		window.addEventListener("fullscreenchange", syncUI)
		syncUI()
	},
}
