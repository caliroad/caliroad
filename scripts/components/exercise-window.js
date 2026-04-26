import { marked } from "https://esm.sh/marked"
import matter from "https://esm.sh/gray-matter"

const exerciseWindow = document.querySelector("#exercise-window")
const exerciseWindowCloseButton = exerciseWindow.querySelector(
	"#exercise-window .close-button"
)
const bannerTitle = exerciseWindow.querySelector(".banner .title")
const bannerImg = exerciseWindow.querySelector(".banner img")
const contentMusclesEl = exerciseWindow.querySelector(".content .muscles")
const contentFreeformEl = exerciseWindow.querySelector(".content .freeform")
const carousel = document.querySelector(".slide-panel .carousel")
const cards = document.querySelectorAll(".slide-panel .card")
const btnPrev = document.querySelector(".slide-panel .nav-btn.prev")
const btnNext = document.querySelector(".slide-panel .nav-btn.next")
const scrollMarker = document.querySelectorAll(".scroll-markers a")

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

export function scrollCarousel(direction) {
	const card = carousel.querySelector(".card")
	const gap = parseFloat(getComputedStyle(carousel).gap) || 0
	const scrollAmount = card ? card.offsetWidth + gap : 320

	carousel.scrollBy({
		left: direction * scrollAmount,
		behavior: "smooth",
	})
}

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				// remove active class from all scroll-markers
				scrollMarker.forEach((dot) => dot.classList.remove("active"))

				// find the scroll-marker that matches the visible card's ID
				const activeId = entry.target.id
				const activeScrollMarker = document.querySelector(
					`.scroll-markers a[href="#${activeId}"]`
				)

				// add active class to that scrollMarker
				if (activeScrollMarker)
					activeScrollMarker.classList.add("active")
			}
		})
	},
	{
		root: carousel,
		threshold: 0.8, // trigger when card is 80% visible
	}
)

// make the observer watch each card
cards.forEach((card) => observer.observe(card))

// client-side routing
async function handleRoute() {
	const hash = window.location.hash.slice(1)

	if (!hash) return

	await loadExercise(hash)
}

window.addEventListener("hashchange", handleRoute)
window.addEventListener("DOMContentLoaded", handleRoute)

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

btnPrev.addEventListener("click", () => scrollCarousel(-1))
btnNext.addEventListener("click", () => scrollCarousel(1))
