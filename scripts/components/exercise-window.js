import { marked } from "https://esm.sh/marked"
import matter from "https://esm.sh/gray-matter"

const exerciseWindow = document.querySelector("#exercise-window")
const exerciseWindowCloseButton = exerciseWindow.querySelector(
	"#exercise-window .close-button"
)
const bannerTitle = exerciseWindow.querySelector(".banner h1")
const bannerImg = exerciseWindow.querySelector(".banner img")
const contentMusclesEl = exerciseWindow.querySelector(".content .muscles")
const contentFreeformEl = exerciseWindow.querySelector(".content .freeform")

exerciseWindowCloseButton.addEventListener("click", () => {
	exerciseWindow.close()
})

// removes the exercise from the hash without reloading the website
exerciseWindow.addEventListener("close", () => {
	history.pushState(
		"",
		document.title,
		window.location.pathname + window.location.search
	)
})

function renderList(className, title, items) {
	if (!items) return ""

	return `
    <div class="${className}">
      <h3>${title}</h3>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `
}

async function getExercise(basePath) {
	try {
		const res = await fetch(basePath + `exercise.md`)

		if (!res.ok) {
			throw new Error(`HTTP error: ${res.status}`)
		}

		const text = await res.text()
		return text
	} catch (err) {
		console.error(err)
		return false
	}
}

function loadExerciseToWindow(exerciseText, basePath) {
	// parse Markdown information
	const { data, content } = matter(exerciseText)
	const exerciseContentHTML = marked.parse(content)

	// render the data
	bannerImg.setAttribute("src", basePath + "banner.jpg")
	bannerTitle.textContent = data.title
	contentFreeformEl.innerHTML = exerciseContentHTML

	const primaryMuscles = renderList(
		"primary-muscles",
		"Primary Muscles",
		data["primary-muscles"]
	)
	const secondaryMuscles = renderList(
		"secondary-muscles",
		"Secondary Muscles",
		data["secondary-muscles"]
	)

	contentMusclesEl.innerHTML = primaryMuscles + secondaryMuscles
}

// verify an exercise exists and renders it to the screen
async function loadExercise(name) {
	const basePath = `../../exercises/${name}/`
	const exerciseText = await getExercise(basePath)

	if (exerciseText !== false) {
		loadExerciseToWindow(exerciseText, basePath)
		exerciseWindow.showModal()
	}
}

// client-side routing
async function handleRoute() {
	const hash = window.location.hash.slice(1)

	if (!hash) return

	await loadExercise(hash)
}

window.addEventListener("hashchange", handleRoute)
window.addEventListener("DOMContentLoaded", handleRoute)
