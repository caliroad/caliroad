const root: HTMLElement = document.documentElement
const colorSchemeMediaQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")

type Theme = "dark" | "light"

function setCurrentThemePreference(): void {
	let newTheme: Theme = colorSchemeMediaQuery.matches ? "dark" : "light"
	const savePreferences: boolean = localStorage.getItem("savePreferences") !== null

	if (savePreferences) {
		const savedTheme: string | null = localStorage.getItem("savedTheme")

		if (savedTheme === "dark" || savedTheme === "light") {
			newTheme = savedTheme
		}
	}

	root.dataset.theme = newTheme
	window.dispatchEvent(new Event("auto-themechange"))
}

setCurrentThemePreference()
colorSchemeMediaQuery.addEventListener("change", setCurrentThemePreference)
