import "./styles.css"
import template from "./template.html?raw"
import type { SettingConfig } from "@app/components/settings-menu/main"

function savePreferences(value: string): void {
	const savePreferences = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		localStorage.setItem("savedLocale", value)
	}
}

export const languageToggleConfig: SettingConfig = {
	template: template,
	init: (container) => {
		const dropdown = container.querySelector<HTMLSelectElement>("#localization-dropdown select")

		if (!dropdown) return

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

		function syncUI(lng: string): void {
			if (dropdown && dropdown.value !== lng) dropdown.value = lng
		}

		window.addEventListener("locale-updated", (e) => {
			const ce = e as CustomEvent
			syncUI(ce.detail.locale)
		})
		window.addEventListener("save-preferences-change", () => savePreferences(dropdown.value))
	},
}
