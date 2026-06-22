import "./styles.css"
import settingsTemplate from "./template.html?raw"

import { themeToggleConfig } from "./components/theme-toggle/main.js"
import { preferencesToggleConfig } from "./components/preferences/main.js"
import { fullscreenToggleConfig } from "./components/fullscreen/main.js"

document.body.insertAdjacentHTML("beforeend", settingsTemplate)

const button = document.getElementById("settings-button")
const settingsMenu = document.getElementById("settings-menu")
const optionsContainer = document.getElementById("options-container")

button.setAttribute("popovertarget", "settings-menu")

button.addEventListener("click", () => {
	requestAnimationFrame(() => {
		const rect = button.getBoundingClientRect()
		settingsMenu.style.top = `${rect.top - settingsMenu.offsetHeight - 8}px`
		settingsMenu.style.left = `${rect.right + 4}px`
	})
})

window.addEventListener("fullscreenchange", () => {
	if (!document.fullscreenElement) {
		settingsMenu.hidePopover()
	}
})

export function registerSetting(settingConfig) {
	optionsContainer.insertAdjacentHTML("beforeend", settingConfig.template)

	if (settingConfig.init) {
		settingConfig.init(optionsContainer)
	}
}

registerSetting(themeToggleConfig)
registerSetting(fullscreenToggleConfig)
registerSetting(preferencesToggleConfig)
