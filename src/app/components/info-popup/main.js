import "./styles.css"
import infoTemplate from "./template.html?raw"

document.body.insertAdjacentHTML("beforeend", infoTemplate)

/** @type {HTMLDialogElement} */
const infoDialog = document.querySelector("#info-popup")
const infoButton = document.querySelector("#info-button")
const infoCloseButton = document.querySelector("#info-popup .close-button")

infoButton.addEventListener("click", () => {
	infoDialog.showModal()
})

infoCloseButton.addEventListener("click", () => {
	infoDialog.close()
})

// check for first-time visitor
const newUser = localStorage.getItem("visited-before")
if (newUser === null) {
	infoDialog.showModal()
	localStorage.setItem("visited-before", "true")
}
