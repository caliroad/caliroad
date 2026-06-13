import "./styles.css"
import template from "./template.html?raw"

export const themeToggleConfig = {
	template: template,
	init: (container) => {
		const toggle = container.querySelector("#dark-mode-toggle input")
		const root = document.documentElement

		toggle.addEventListener("change", () => {
			let isChecked = toggle.checked
			let newTheme = isChecked ? "dark" : "light"
			let savePreferences = localStorage.getItem("savePreferences") !== null

			if (savePreferences) {
				localStorage.setItem("savedTheme", newTheme)
			}

			root.dataset.theme = newTheme
		})

		function syncUI() {
			toggle.checked = root.dataset.theme === "dark"
		}

		window.addEventListener("themechange", syncUI)
		syncUI()
	},
}
