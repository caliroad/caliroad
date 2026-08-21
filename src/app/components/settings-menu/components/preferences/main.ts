import "./styles.css"
import template from "./template.html?raw"
import type { SettingConfig } from "@app/components/settings-menu/main"

export const preferencesToggleConfig: SettingConfig = {
	template: template,
	init: (container: HTMLElement) => {
		const toggle = container.querySelector<HTMLInputElement>("#preferences-toggle input")

		if (!toggle) return

		toggle.addEventListener("change", () => {
			const isChecked = toggle?.checked

			if (isChecked) localStorage.setItem("savePreferences", "")
			else localStorage.removeItem("savePreferences")

			window.dispatchEvent(new CustomEvent("save-preferences-change"))
		})

		function syncUI(): void {
			if (toggle) toggle.checked = localStorage.getItem("savePreferences") !== null
		}

		syncUI()
	},
}
