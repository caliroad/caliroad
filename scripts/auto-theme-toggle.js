const root = document.documentElement

const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

function setCurrentThemePreference() {
	let newTheme = colorSchemeMediaQuery.matches ? "dark" : "light"
	let savePreferences = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		let savedTheme = localStorage.getItem("savedTheme")
		if (savedTheme !== null) newTheme = savedTheme
	}

	root.dataset.theme = newTheme

	window.dispatchEvent(new Event("themechange"))
}

setCurrentThemePreference()
colorSchemeMediaQuery.addEventListener("change", setCurrentThemePreference)
