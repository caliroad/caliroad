import "./styles.css"
import template from "./template.html?raw"

export const preferencesToggleConfig = {
	template: template,
	init: (container) => {
		const toggle = container.querySelector("#preferences-toggle input")
		const root = document.documentElement

		toggle.addEventListener("change", () => {
			let isChecked = toggle.checked

			if (isChecked) {
				localStorage.setItem("savePreferences", "")
				localStorage.setItem("savedTheme", root.dataset.theme)
			} else {
				localStorage.removeItem("savePreferences")
			}
		})

		function syncUI() {
			toggle.checked = localStorage.getItem("savePreferences") !== null
		}

		syncUI()
	},
}
