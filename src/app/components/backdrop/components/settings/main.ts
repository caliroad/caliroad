import "./styles.css"
import template from "./template.html?raw"
import type { SettingConfig } from "@app/components/settings-menu/main"

function savePreferences(value: boolean): void {
	const savePreferences: boolean = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		localStorage.setItem("savedBackgroundAnimationState", value.toString())
	}
}

export const backgroundAnimationToggleConfig: SettingConfig = {
	template: template,
	init: (container: HTMLElement): void => {
		const toggle = container.querySelector<HTMLInputElement>("#background-animation-toggle input")
		const meshBackground = document.querySelector(".mesh-background")

		if (!toggle) return

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

		function syncUI(): void {
			if (toggle) toggle.checked = !meshBackground?.classList.contains("paused")
		}

		syncUI()
		window.addEventListener("save-preferences-change", () => savePreferences(toggle.checked))
	},
}
