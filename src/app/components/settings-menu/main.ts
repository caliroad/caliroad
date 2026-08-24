import "./styles.css"
import settingsTemplate from "./template.html?raw"
import settingsSVG from "./assets/icon.svg?raw"

import { themeToggleConfig } from "./components/theme-toggle/main.js"
import { preferencesToggleConfig } from "./components/preferences/main.js"
import { fullscreenToggleConfig } from "./components/fullscreen/main.js"

const settingsIconContainer = document.getElementById("settings-icon")
if (settingsIconContainer) settingsIconContainer.innerHTML = settingsSVG

document.body.insertAdjacentHTML("beforeend", settingsTemplate)

const button = document.querySelector<HTMLButtonElement>("#settings-button")
const settingsMenu = document.getElementById("settings-menu")
const optionsContainer = document.getElementById("options-container")

button?.setAttribute("popovertarget", "settings-menu")

button?.addEventListener("click", () => {
	requestAnimationFrame(() => {
		const rect = button.getBoundingClientRect()
		if (settingsMenu) {
			settingsMenu.style.top = `${rect.top - settingsMenu.offsetHeight - 8}px`
			settingsMenu.style.left = `${rect.right + 4}px`
		}
	})
})

window.addEventListener("fullscreenchange", () => {
	if (!document.fullscreenElement) {
		settingsMenu?.hidePopover()
	}
})

export interface SettingConfig {
	template: string
	init: (container: HTMLElement) => void
}

export function registerSetting(settingConfig: SettingConfig): void {
	if (!optionsContainer) return

	optionsContainer?.insertAdjacentHTML("beforeend", settingConfig.template)

	if (settingConfig.init) {
		settingConfig.init(optionsContainer)
	}
}

registerSetting(themeToggleConfig)
registerSetting(fullscreenToggleConfig)
registerSetting(preferencesToggleConfig)
