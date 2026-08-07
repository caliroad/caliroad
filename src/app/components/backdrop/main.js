import "./styles.css"
import backdropTemplate from "./template.html?raw"

document.querySelector("main").insertAdjacentHTML("beforeend", backdropTemplate)
const meshBackground = document.querySelector(".mesh-background")

function assertPausedState(shouldPause) {
	if (shouldPause) {
		meshBackground.classList.add("paused")
	} else {
		meshBackground.classList.remove("paused")
	}
}

// pause all CSS animations when the page is not visible
document.addEventListener("visibilitychange", () => assertPausedState(document.hidden))

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
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
motionQuery.addEventListener("change", (e) => assertPausedState(e.matches))
