import "./styles.css"
import infoTemplate from "./template.html?raw"
import infoSVG from "./assets/icon.svg?raw"

const infoIconContainer = document.getElementById("info-icon")
if (infoIconContainer) infoIconContainer.outerHTML = infoSVG

document.body.insertAdjacentHTML("beforeend", infoTemplate)

const infoDialog = document.querySelector<HTMLDialogElement>("#info-popup")
const infoButton = document.querySelector<HTMLButtonElement>("#info-button")
const infoCloseButton = document.querySelector<HTMLButtonElement>("#info-popup .close-button")

infoButton?.addEventListener("click", () => {
	infoDialog?.showModal()
})

infoCloseButton?.addEventListener("click", () => {
	infoDialog?.close()
})

// check for first-time visitor
const newUser = localStorage.getItem("visited-before")

if (newUser === null) {
	infoDialog?.showModal()
	localStorage.setItem("visited-before", "true")
}
