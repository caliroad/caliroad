import "./styles.css"
import template from "./template.html?raw"
import type { SettingConfig } from "@app/components/settings-menu/main"

function savePreferences(value: string): void {
	const savePreferences = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		localStorage.setItem("savedTheme", value)
	}
}

export const themeToggleConfig: SettingConfig = {
	template: template,
	init: (container) => {
		const toggle = container.querySelector<HTMLInputElement>("#dark-mode-toggle input")
		const root = document.documentElement

		if (!toggle) return

		toggle.addEventListener("change", () => {
			const isChecked = toggle?.checked
			const newTheme = isChecked ? "dark" : "light"

			savePreferences(newTheme)

			root.dataset.theme = newTheme
			window.dispatchEvent(new CustomEvent("manual-themechange"))
		})

		function syncUI(): void {
			if (toggle) toggle.checked = root.dataset.theme === "dark"
		}

		window.addEventListener("auto-themechange", syncUI)
		syncUI()
		window.addEventListener("save-preferences-change", () => {
			const newTheme = root.dataset.theme
			if (newTheme) savePreferences(newTheme)
		})
	},
}
