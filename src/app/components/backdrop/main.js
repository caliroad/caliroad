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

// pause animations when the page is not focused
window.addEventListener("blur", () => {
	meshBackground.classList.add("paused")
})

window.addEventListener("focus", () => {
	if (!document.hidden) {
		meshBackground.classList.remove("paused")
	}
})

// pause animations if the user prefers reduced motion
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

if (prefersReducedMotion) {
	meshBackground.classList.add("paused")
}
