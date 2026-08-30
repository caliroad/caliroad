import "./styles.css"
import windowTemplate from "./template.html?raw"
import { getExerciseData } from "@shared/utils/data-fetcher.js"
import { renderBanner } from "./components/banner/main.js"
import { renderVariations } from "./components/variations/main.js"
import { renderMuscles } from "./components/muscles/main.js"
import { renderCarousel } from "./components/carousel/main.js"

const parser = new DOMParser()
const doc = parser.parseFromString(windowTemplate, "text/html")
const exerciseDialogTemplate = doc.querySelector("#exercise-window")
const dialogInnerSkeleton: string = exerciseDialogTemplate ? exerciseDialogTemplate.innerHTML : ""

document.body.insertAdjacentHTML("beforeend", windowTemplate)

const exerciseWindow = document.querySelector<HTMLDialogElement>("#exercise-window")!

let alreadyWentBack: boolean = false

exerciseWindow.addEventListener("close", () => {
	// restore body scroll
	document.body.style.overflow = ""

	if (alreadyWentBack) {
		alreadyWentBack = false
		return
	}
	history.back()
})

function closeExerciseWindow(): void {
	if (exerciseWindow.open) {
		document.title = "Caliroad"
		exerciseWindow.close()
	}
}

async function loadExercise(name: string | null, category: string | null = null): Promise<void> {
	if (!name) return closeExerciseWindow()

	const exerciseData = getExerciseData(name, category)
	if (!exerciseData) {
		history.back()
		return
	}

	exerciseWindow.innerHTML = dialogInnerSkeleton
	// prevent body from scrolling while exercise is open
	document.body.style.overflow = "hidden"

	const exerciseWindowBackButton = exerciseWindow.querySelector<HTMLButtonElement>(".back-button")

	if (exerciseWindowBackButton) {
		exerciseWindowBackButton.addEventListener("click", () => {
			alreadyWentBack = true
			history.back()
		})
	}

	const exerciseNameCapitalized = name[0].toUpperCase() + name.slice(1)
	document.title = `Caliroad | ${exerciseNameCapitalized}`

	const contentFreeformEl = exerciseWindow.querySelector<HTMLElement>(".content .freeform")
	if (contentFreeformEl) {
		contentFreeformEl.innerHTML = await exerciseData.htmlContent
	}

	renderBanner(exerciseData.title, exerciseData.assets)
	renderVariations(exerciseData.attributes, exerciseData.category)
	renderMuscles(exerciseData.attributes)

	if (exerciseData.attributes.videos) {
		renderCarousel(exerciseData.attributes.videos)
	}

	if (!exerciseWindow.open) {
		exerciseWindow.showModal()
	}
}

async function handleRoute(): Promise<void> {
	// strip leading '#' or '#/'
	const route = window.location.hash.replace(/^#\/?/, "")

	if (!route) {
		await loadExercise(null, null)
		return
	}

	const parts = route.split("/")

	// support nested routes (/#/calisthenics/planche) and fallback routes (/#/planche)
	const category = parts.length > 1 ? parts[0] : null
	const name = parts.length > 1 ? parts[1] : parts[0]

	await loadExercise(name, category)
}

window.addEventListener("hashchange", handleRoute)

if (window.location.hash) {
	handleRoute()
}
