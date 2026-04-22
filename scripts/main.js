const infoDialog = document.querySelector("#info-popup")
const infoButton = document.querySelector("#info-button")
const infoCloseButton = document.querySelector("#info-popup .close-button")

const newUser = localStorage.getItem("visited-before")
if (newUser === null) {
	infoDialog.showModal()
	localStorage.setItem("visited-before", "true")
}

infoButton.addEventListener("click", () => {
	infoDialog.showModal()
})

infoCloseButton.addEventListener("click", () => {
	infoDialog.close()
})

const button = document.getElementById("settings-button")
const popover = document.getElementById("settings-menu")

button.addEventListener("click", () => {
	// wait for popover to open
	requestAnimationFrame(() => {
		const rect = button.getBoundingClientRect()

		popover.style.top = `${rect.top - popover.offsetHeight - 8}px`
		popover.style.left = `${rect.right + 4}px`
	})
})
