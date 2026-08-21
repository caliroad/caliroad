import "./styles.css"
import template from "./template.html?raw"
import type { SettingConfig } from "@app/components/settings-menu/main"

export const fullscreenToggleConfig: SettingConfig = {
	template: template,
	init: (container: HTMLElement): void => {
		const toggle = container.querySelector<HTMLInputElement>("#fullscreen-toggle input")

		if (!toggle) return

		toggle.addEventListener("change", () => {
			const isChecked = toggle.checked

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

		function syncUI(): void {
			if (toggle) toggle.checked = document.fullscreenElement !== null
		}

		window.addEventListener("fullscreenchange", syncUI)
		syncUI()
	},
}
