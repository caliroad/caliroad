const button = document.getElementById("settings-button")
const settingsMenu = document.getElementById("settings-menu")
const root = document.documentElement

button.addEventListener("click", () => {
	// wait for settingsMenu to open
	requestAnimationFrame(() => {
		const rect = button.getBoundingClientRect()

		settingsMenu.style.top = `${rect.top - settingsMenu.offsetHeight - 8}px`
		settingsMenu.style.left = `${rect.right + 4}px`
	})
})

const settingsMenuDarkModeToggle = settingsMenu.querySelector(
	"#dark-mode-toggle input"
)

const settingsMenuPreferencesToggle = settingsMenu.querySelector(
	"#preferences-toggle input"
)

settingsMenuDarkModeToggle.addEventListener("change", () => {
	let isChecked = settingsMenuDarkModeToggle.checked
	let newTheme = isChecked ? "dark" : "light"
	let savePreferences = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		localStorage.setItem("savedTheme", newTheme)
	}

	root.dataset.theme = newTheme
})

// sync darkModeToggle's state to system theme changes and page reloads
function syncDarkModeToggle() {
	settingsMenuDarkModeToggle.checked = root.dataset.theme === "dark"
}

window.addEventListener("themechange", syncDarkModeToggle)
document.addEventListener("DOMContentLoaded", syncDarkModeToggle)

settingsMenuPreferencesToggle.addEventListener("change", () => {
	let isChecked = settingsMenuPreferencesToggle.checked

	if (isChecked) {
		localStorage.setItem("savePreferences", "")
		localStorage.setItem("savedTheme", root.dataset.theme)
	} else localStorage.removeItem("savePreferences")
})
