import "./styles.css"
import backdropTemplate from "./template.html?raw"

document.querySelector("main").insertAdjacentHTML("beforeend", backdropTemplate)

// pause all CSS animations when the page is not visible
const meshBackground = document.querySelector(".mesh-background")

document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		meshBackground.classList.add("paused")
	} else {
		meshBackground.classList.remove("paused")
	}
})

// pause all CSS animations when the page is not focused
window.addEventListener("blur", () => {
	meshBackground.classList.add("paused")
})

window.addEventListener("focus", () => {
	if (!document.hidden) {
		meshBackground.classList.remove("paused")
	}
})
