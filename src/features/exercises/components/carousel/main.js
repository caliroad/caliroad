import "./styles.css"
import carouselTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"

/** @type {HTMLElement | null} */
let carousel = null
/** @type {HTMLElement | null} */
let btnPrev = null
/** @type {HTMLElement | null} */
let btnNext = null
/** @type {IntersectionObserver | null} */
let observer = null

function getVideoThumbnailURL(videoURL) {
	const searchPatterns = [/youtu\.be\/([^?&]+)/, /youtube\.com\/watch\?v=([^?&]+)/, /youtube\.com\/embed\/([^?&]+)/]

	for (const pattern of searchPatterns) {
		const videoID = videoURL.match(pattern)?.[1]
		if (videoID) return `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`
	}
	return null
}

async function getVideoMeta(videoURL) {
	try {
		const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoURL)}&format=json`
		const res = await fetch(endpoint)
		if (!res.ok) throw new Error("Failed to fetch metadata")

		const data = await res.json()
		return {
			videoTitle: data.title,
			author: data.author_name,
			authorUrl: data.author_url,
		}
	} catch (err) {
		console.error(err)
		return { videoTitle: "Unknown title", author: "", authorUrl: "" }
	}
}

function scrollCarousel(direction) {
	if (!carousel) return
	const cards = Array.from(carousel.querySelectorAll(".card"))
	const carouselRect = carousel.getBoundingClientRect()

	const currentIdx = cards.findIndex((card) => {
		const rect = card.getBoundingClientRect()
		return rect.left >= carouselRect.left - 1
	})

	let targetIdx = currentIdx + direction
	targetIdx = Math.max(0, Math.min(cards.length - 1, targetIdx))

	if (cards[targetIdx]) {
		cards[targetIdx].scrollIntoView({
			behavior: "smooth",
			inline: "center",
			block: "nearest",
		})
	}
}

// Private setup wrapper to ensure HTML elements are present before touch points are wired
function initCarouselElements() {
	queryReplace("#carousel-placeholder", carouselTemplate)
	// const placeholder = document.querySelector("#carousel-placeholder")
	// if (placeholder) placeholder.outerHTML = carouselTemplate

	carousel = document.querySelector(".slide-panel .carousel")
	btnPrev = document.querySelector(".slide-panel .nav-btn.prev")
	btnNext = document.querySelector(".slide-panel .nav-btn.next")

	if (!carousel || !btnPrev || !btnNext) {
		console.warn("Carousel wrapper markup elements not found in DOM yet.")
		return false
	}

	// Attach navigation listeners cleanly
	btnPrev.addEventListener("click", () => scrollCarousel(-1))
	btnNext.addEventListener("click", () => scrollCarousel(1))

	// Initialize observer bound to the confirmed local carousel container element
	observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					document.querySelectorAll(".scroll-markers a").forEach((dot) => dot.classList.remove("active"))

					const activeId = entry.target.id
					const activeScrollMarker = document.querySelector(`.scroll-markers a[href="#${activeId}"]`)

					if (activeScrollMarker) {
						activeScrollMarker.classList.add("active")
					}
				}
			})
		},
		{
			root: carousel,
			threshold: 0.95,
		}
	)

	return true
}

export function renderCarousel(videos) {
	if (!videos || !videos.length) return

	initCarouselElements()

	carousel.innerHTML = ""
	const markersContainer = document.querySelector(".scroll-markers")
	if (!markersContainer) return
	markersContainer.innerHTML = ""

	// Notice we removed the "async" keyword from the forEach callback
	videos.forEach((videoURL, idx) => {
		// Stage 1: immediate skeleton injection
		const card = document.createElement("div")
		const img = document.createElement("img")
		const title = document.createElement("h1")
		const marker = document.createElement("a")
		const cardID = `card-${idx + 1}`

		card.className = "card skeleton"
		title.className = "title"
		img.className = "thumbnail"
		card.id = cardID
		img.alt = "Video Thumbnail"
		marker.className = "marker"
		marker.href = `#${cardID}`

		card.appendChild(img)
		card.appendChild(title)
		carousel.appendChild(card)
		markersContainer.appendChild(marker)

		if (observer) observer.observe(card)

		// stage 2: asynchronous hydration ---
		const thumbURL = getVideoThumbnailURL(videoURL)
		if (thumbURL) img.src = thumbURL

		// fetch the YouTube metadata
		getVideoMeta(videoURL).then(({ videoTitle, author }) => {
			title.textContent = `${videoTitle} — @${author}`

			// function to trigger the CSS reveal animation
			const revealCard = () => {
				card.classList.remove("skeleton")
				card.classList.add("loaded")
				// only allow clicking after it's fully loaded
				card.addEventListener("click", () => {
					window.open(videoURL, "_blank")
				})
			}

			// wait for the thumbnail image to actually finish downloading before revealing
			if (img.complete) {
				revealCard()
			} else {
				img.onload = revealCard
				img.onerror = revealCard // reveal anyway if the thumbnail fails to load
			}
		})
	})
}
