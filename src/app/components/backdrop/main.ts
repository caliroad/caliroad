import "./styles.css"
import backdropTemplate from "./template.html?raw"
import { registerSetting } from "@app/components/settings-menu/main"
import { backgroundAnimationToggleConfig } from "./components/settings/main"

document.querySelector("main")?.insertAdjacentHTML("beforeend", backdropTemplate)
const meshBackground = document.querySelector(".mesh-background")

function pauseAnimations(shouldPause: boolean): void {
	if (shouldPause) meshBackground?.classList.add("paused")
	else meshBackground?.classList.remove("paused")
}

function pauseAnimationsIfNoSetting(shouldPause: boolean): void {
	const savePreferences = localStorage.getItem("savePreferences") !== null

	if (!savePreferences) pauseAnimations(shouldPause)
}

// pause animations if the user prefers reduced motion
const motionQuery: MediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)")
motionQuery.addEventListener("change", (e) => pauseAnimations(e.matches))

// pause animations when the page is not visible
document.addEventListener("visibilitychange", () => pauseAnimationsIfNoSetting(document.hidden))

// pause animations when the page is not focused
window.addEventListener("blur", () => pauseAnimationsIfNoSetting(true))
window.addEventListener("focus", () => {
	if (!document.hidden) pauseAnimationsIfNoSetting(false)
})

// pause animations when settings change
window.addEventListener("background-animation-change", (e) => {
	const ce = e as CustomEvent
	pauseAnimations(ce.detail.isAnimationOn)
})

const savePreferences = localStorage.getItem("savePreferences") !== null

if (savePreferences) {
	const savedBackgroundAnimationState = localStorage.getItem("savedBackgroundAnimationState")

	if (savedBackgroundAnimationState !== null) {
		pauseAnimations(!(savedBackgroundAnimationState === "true"))
	}
}

registerSetting(backgroundAnimationToggleConfig)
