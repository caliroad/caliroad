const root = document.documentElement

const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

function setCurrentThemePreference() {
	root.dataset.theme = colorSchemeMediaQuery.matches ? "dark" : "light"
}

setCurrentThemePreference()
colorSchemeMediaQuery.addEventListener("change", setCurrentThemePreference)
