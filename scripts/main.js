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
