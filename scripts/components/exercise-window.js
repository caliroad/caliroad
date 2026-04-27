import { marked } from "https://esm.sh/marked"
import matter from "https://esm.sh/gray-matter"

const exerciseWindow = document.querySelector("#exercise-window")
const exerciseWindowCloseButton = exerciseWindow.querySelector(".close-button")
const bannerTitle = exerciseWindow.querySelector(".banner .title")
const bannerImg = exerciseWindow.querySelector(".banner img")
const contentMusclesEl = exerciseWindow.querySelector(".content .muscles")
const contentFreeformEl = exerciseWindow.querySelector(".content .freeform")
const carousel = document.querySelector(".slide-panel .carousel")
const btnPrev = document.querySelector(".slide-panel .nav-btn.prev")
const btnNext = document.querySelector(".slide-panel .nav-btn.next")

// ################ Carousel

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				// remove active class from all scroll-markers
				document
					.querySelectorAll(".scroll-markers a")
					.forEach((dot) => dot.classList.remove("active"))

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
		threshold: 0.95, // trigger when card is 95% visible
	}
)

/**
 * Extract ID from YouTube video and get thumbnail URL
 * @param {string} videoURL - YouTube video URL
 *
 * @returns {string} video thumbnail URL
 * */
function getVideoThumbnailURL(videoURL) {
	// ID search patterns
	const searchPatterns = [
		/youtu\.be\/([^?&]+)/,
		/youtube\.com\/watch\?v=([^?&]+)/,
		/youtube\.com\/embed\/([^?&]+)/,
	]

	for (const pattern of searchPatterns) {
		const videoID = videoURL.match(pattern)?.[1]

		if (videoID)
			return `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`
	}

	return null
}

/**
 * Render the Carousel in the exercise window
 * It clears the Carousel and Scroll Markers, and, for every video,
 * creates a card to show the video's thumbnail on and a scroll marker
 * to represet its position
 * @param {string[]} videos - list of video URLs
 * */
function renderCarouselVideos(videos) {
	if (!videos || !videos.length) return

	// clear Carousel and Scroll Markers
	carousel.innerHTML = ""
	const markersContainer = document.querySelector(".scroll-markers")
	markersContainer.innerHTML = ""

	// create card and add a scroll marker for every video
	videos.forEach((videoURL, idx) => {
		const card = document.createElement("img")
		const marker = document.createElement("a")
		const cardID = `card-${idx + 1}`

		card.className = "card"
		card.id = cardID
		card.src = getVideoThumbnailURL(videoURL)

		marker.className = "marker"
		marker.href = `#${cardID}`

		card.addEventListener("click", () => {
			window.open(videoURL, "_blank")
		})

		carousel.appendChild(card)
		markersContainer.appendChild(marker)
		observer.observe(card)
	})
}

/**
 * Scroll the Carousel
 * */
function scrollCarousel(direction) {
	// convert cards to Array in order to use .findIndex()
	const cards = Array.from(carousel.querySelectorAll(".card"))

	// get size and position of the Carousel in the viewport
	const carouselRect = carousel.getBoundingClientRect()

	// find the idx of the card whose left edge is inside or just at
	// the visible area of the Carousel
	const currentIdx = cards.findIndex((card) => {
		const rect = card.getBoundingClientRect()
		return rect.left >= carouselRect.left - 1
	})

	// add the idx of the left most visible card to the desired
	// direction
	let targetIdx = currentIdx + direction

	// clamp the idx to prevent it going out of bounds
	targetIdx = Math.max(0, Math.min(cards.length - 1, targetIdx))

	cards[targetIdx].scrollIntoView({
		behavior: "smooth",
		inline: "center",
	})
}

btnPrev.addEventListener("click", () => scrollCarousel(-1))
btnNext.addEventListener("click", () => scrollCarousel(1))

// ################ Exercise Fetcher
// Get an exercise's data, banner and logo and render it to the exercise window

function makeList(className, title, items) {
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

/**
 * Fetch exercise using relative path
 *
 * @returns {string} Content of the exercise's Markdown file if it exists
 * */
async function getRawExerciseData(basePath) {
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

function renderBanner(data, basePath) {
	bannerImg.setAttribute("src", basePath + "banner.jpg")
	bannerTitle.textContent = data.title
}

function renderMuscles(data) {
	const primaryMuscles = makeList(
		"primary-muscles",
		"Primary Muscles",
		data["primary-muscles"]
	)
	const secondaryMuscles = makeList(
		"secondary-muscles",
		"Secondary Muscles",
		data["secondary-muscles"]
	)

	contentMusclesEl.innerHTML = primaryMuscles + secondaryMuscles
}

function loadExerciseToWindow(exerciseText, basePath) {
	// parse Markdown information
	const { data, content } = matter(exerciseText)

	renderBanner(data, basePath)
	renderMuscles(data)
	const exerciseContentHTML = marked.parse(content)
	contentFreeformEl.innerHTML = exerciseContentHTML
	renderCarouselVideos(data.videos)
}

// verify an exercise exists and renders it to the screen
async function loadExercise(name) {
	const basePath = `../../exercises/${name}/`
	const exerciseText = await getRawExerciseData(basePath)

	if (exerciseText !== false) {
		loadExerciseToWindow(exerciseText, basePath)
		exerciseWindow.showModal()
	}
}

exerciseWindowCloseButton.addEventListener("click", () => {
	exerciseWindow.close()
})

// ################ Client-side Routing
// Read changes in the website's hash to load a particular exercise

/**
 * Check if hash is not empty in order to load an exercise
 * */
async function handleRoute() {
	const hash = window.location.hash.slice(1)
	if (!hash) return

	await loadExercise(hash)
}

window.addEventListener("hashchange", handleRoute)
window.addEventListener("DOMContentLoaded", handleRoute)

// removes the exercise from the hash without reloading the website
exerciseWindow.addEventListener("close", () => {
	history.pushState(
		"",
		document.title,
		window.location.pathname + window.location.search
	)
})
