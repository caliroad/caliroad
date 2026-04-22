const button = document.getElementById("settings-button")
const settingsMenu = document.getElementById("settings-menu")

button.addEventListener("click", () => {
	// wait for settingsMenu to open
	requestAnimationFrame(() => {
		const rect = button.getBoundingClientRect()

		settingsMenu.style.top = `${rect.top - settingsMenu.offsetHeight - 8}px`
		settingsMenu.style.left = `${rect.right + 4}px`
	})
})

const settingsMenuToggleButton = settingsMenu.querySelector(
	"#theme-toggle input"
)

const root = document.documentElement

settingsMenuToggleButton.addEventListener("change", () => {
	let currentTheme = root.dataset.theme

	root.dataset.theme = currentTheme == "light" ? "dark" : "light"
})
