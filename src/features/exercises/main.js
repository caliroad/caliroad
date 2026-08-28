// src/features/exercises/exercises.js
import "./styles.css"
import windowTemplate from "./template.html?raw"

const parser = new DOMParser()
const doc = parser.parseFromString(windowTemplate, "text/html")
const dialogInnerSkeleton = doc.querySelector("#exercise-window").innerHTML

import { getExerciseData } from "@shared/utils/data-fetcher.js"
import { renderBanner } from "./components/banner/main.js"
import { renderVariations } from "./components/variations/main.js"
import { renderMuscles } from "./components/muscles/main.js"
import { renderCarousel } from "./components/carousel/main.js"

document.body.insertAdjacentHTML("beforeend", windowTemplate)

/** @type {HTMLDialogElement} */
const exerciseWindow = document.querySelector("#exercise-window")

let alreadyWentBack = false

exerciseWindow.addEventListener("close", () => {
	// restore body scroll
	document.body.style.overflow = ""

	if (alreadyWentBack) {
		alreadyWentBack = false
		return
	}
	history.back()
})

function closeExerciseWindow() {
	if (exerciseWindow.open) {
		document.title = "Caliroad"
		exerciseWindow.close()
	}
}

async function loadExercise(name, category) {
	if (!name) return closeExerciseWindow()

	const exerciseData = getExerciseData(name, category)
	if (!exerciseData) {
		history.back()
		return
	}

	exerciseWindow.innerHTML = dialogInnerSkeleton
	// prevent body from scrolling while exercise is open
	document.body.style.overflow = "hidden"

	const exerciseWindowBackButton = exerciseWindow.querySelector(".back-button")

	exerciseWindowBackButton.addEventListener("click", () => {
		alreadyWentBack = true
		history.back()
	})

	const exerciseNameCapitalized = name[0].toUpperCase() + name.slice(1)
	document.title = `Caliroad | ${exerciseNameCapitalized}`

	const contentFreeformEl = exerciseWindow.querySelector(".content .freeform")
	contentFreeformEl.innerHTML = await exerciseData.htmlContent

	renderBanner(exerciseData.title, exerciseData.assets)
	renderVariations(exerciseData.attributes, exerciseData.category)
	renderMuscles(exerciseData.attributes)
	renderCarousel(exerciseData.attributes.videos)

	if (!exerciseWindow.open) {
		exerciseWindow.showModal()
	}
}

async function handleRoute() {
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
