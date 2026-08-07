import "./styles.css"
import template from "./template.html?raw"

function savePreferences(value) {
	let savePreferences = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		localStorage.setItem("savedTheme", value)
	}
}

export const themeToggleConfig = {
	template: template,
	init: (container) => {
		const toggle = container.querySelector("#dark-mode-toggle input")
		const root = document.documentElement

		toggle.addEventListener("change", () => {
			let isChecked = toggle.checked
			let newTheme = isChecked ? "dark" : "light"

			savePreferences(newTheme)

			root.dataset.theme = newTheme
			window.dispatchEvent(new CustomEvent("manual-themechange"))
		})

		function syncUI() {
			toggle.checked = root.dataset.theme === "dark"
		}

		window.addEventListener("auto-themechange", syncUI)
		syncUI()
		window.addEventListener("save-preferences-change", () => savePreferences(root.dataset.theme))
	},
}
