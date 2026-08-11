import "./styles.css"
import template from "./template.html?raw"

function savePreferences(value) {
	let savePreferences = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		localStorage.setItem("savedLocale", value)
	}
}

export const languageToggleConfig = {
	template: template,
	init: (container) => {
		const dropdown = container.querySelector("#localization-dropdown select")

		dropdown.addEventListener("change", () => {
			savePreferences(dropdown.value)

			window.dispatchEvent(
				new CustomEvent("request-locale-change", {
					detail: {
						locale: dropdown.value,
					},
				})
			)
		})

		function syncUI(lng) {
			if (dropdown.value !== lng) dropdown.value = lng
		}

		window.addEventListener("locale-updated", (e) => {
			syncUI(e.detail.locale)
		})
		window.addEventListener("save-preferences-change", () => savePreferences(dropdown.value))
	},
}
