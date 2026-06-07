import "./styles.css"
import settingsTemplate from "./template.html?raw"

document.body.insertAdjacentHTML("beforeend", settingsTemplate)

const button = document.getElementById("settings-button")
const settingsMenu = document.getElementById("settings-menu")
const root = document.documentElement

button.setAttribute("popovertarget", "settings-menu")

button.addEventListener("click", () => {
	requestAnimationFrame(() => {
		const rect = button.getBoundingClientRect()
		settingsMenu.style.top = `${rect.top - settingsMenu.offsetHeight - 8}px`
		settingsMenu.style.left = `${rect.right + 4}px`
	})
})

/** @type {HTMLInputElement} */
const settingsMenuDarkModeToggle = settingsMenu.querySelector("#dark-mode-toggle input")
/** @type {HTMLInputElement} */
const settingsMenuPreferencesToggle = settingsMenu.querySelector("#preferences-toggle input")

settingsMenuDarkModeToggle.addEventListener("change", () => {
	let isChecked = settingsMenuDarkModeToggle.checked
	let newTheme = isChecked ? "dark" : "light"
	let savePreferences = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		localStorage.setItem("savedTheme", newTheme)
	}

	root.dataset.theme = newTheme
})

settingsMenuPreferencesToggle.addEventListener("change", () => {
	let isChecked = settingsMenuPreferencesToggle.checked

	if (isChecked) {
		localStorage.setItem("savePreferences", "")
		localStorage.setItem("savedTheme", root.dataset.theme)
	} else {
		localStorage.removeItem("savePreferences")
	}
})

function syncSettingsUI() {
	settingsMenuDarkModeToggle.checked = root.dataset.theme === "dark"
	settingsMenuPreferencesToggle.checked = localStorage.getItem("savePreferences") !== null
}

window.addEventListener("themechange", syncSettingsUI)

syncSettingsUI()
