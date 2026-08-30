import "./styles.css"
import carouselTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"

export interface VideoMeta {
	videoTitle: string
	author: string
	authorUrl: string
}

interface YouTubeOEmbedResponse {
	title: string
	author_name: string
	author_url: string
}

let carousel: HTMLElement | null = null
let btnPrev: HTMLElement | null = null
let btnNext: HTMLElement | null = null
let observer: IntersectionObserver | null = null

function getVideoThumbnailURL(videoURL: string): string | null {
	const searchPatterns: RegExp[] = [
		/youtu\.be\/([^?&]+)/,
		/youtube\.com\/watch\?v=([^?&]+)/,
		/youtube\.com\/embed\/([^?&]+)/,
	]

	for (const pattern of searchPatterns) {
		const videoID = videoURL.match(pattern)?.[1]
		if (videoID) return `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`
	}
	return null
}

async function getVideoMeta(videoURL: string): Promise<VideoMeta> {
	try {
		const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoURL)}&format=json`
		const res = await fetch(endpoint)
		if (!res.ok) throw new Error("Failed to fetch metadata")

		const data: YouTubeOEmbedResponse = await res.json()
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

function scrollCarousel(direction: number): void {
	if (!carousel) return
	const cards = Array.from(carousel.querySelectorAll<HTMLElement>(".card"))
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

function initCarouselElements(): boolean {
	queryReplace("#carousel-placeholder", carouselTemplate)

	carousel = document.querySelector<HTMLElement>(".slide-panel .carousel")
	btnPrev = document.querySelector<HTMLElement>(".slide-panel .nav-btn.prev")
	btnNext = document.querySelector<HTMLElement>(".slide-panel .nav-btn.next")

	if (!carousel || !btnPrev || !btnNext) {
		console.warn("Carousel wrapper markup elements not found in DOM yet.")
		return false
	}

	// attach navigation listeners cleanly
	btnPrev.addEventListener("click", () => scrollCarousel(-1))
	btnNext.addEventListener("click", () => scrollCarousel(1))

	// initialize observer bound to the confirmed local carousel container element
	observer = new IntersectionObserver(
		(entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					document.querySelectorAll(".scroll-markers a").forEach((dot) => dot.classList.remove("active"))

					const activeId = entry.target.id
					const activeScrollMarker = document.querySelector<HTMLAnchorElement>(
						`.scroll-markers a[href="#${activeId}"]`
					)

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

export function renderCarousel(videos: string[] | undefined | null): void {
	if (!videos || !videos.length) return

	if (!initCarouselElements() || !carousel) return

	carousel.innerHTML = ""
	const markersContainer = document.querySelector<HTMLElement>(".scroll-markers")
	if (!markersContainer) return
	markersContainer.innerHTML = ""

	videos.forEach((videoURL: string, idx: number) => {
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
		carousel!.appendChild(card)
		markersContainer.appendChild(marker)

		if (observer) observer.observe(card)

		// asynchronous hydration
		const thumbURL = getVideoThumbnailURL(videoURL)
		if (thumbURL) img.src = thumbURL

		// fetch the YouTube metadata
		getVideoMeta(videoURL).then(({ videoTitle, author }: VideoMeta) => {
			title.textContent = `${videoTitle} — @${author}`

			// function to trigger the CSS reveal animation
			const revealCard = (): void => {
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
