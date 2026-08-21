import "./styles.css"
import musclesDiagramTemplate from "./template.html?raw"
import frontDiagram from "./assets/front.svg?raw"
import backDiagram from "./assets/back.svg?raw"

import { queryReplace } from "@shared/utils/query-replace"
import { unhyphenateCapitalize } from "@shared/utils/unhyphenate-capitalize"

const TOOLTIP_OFFSET = 16

function makeSVGPathHighlighter(
	element: SVGGraphicsElement,
	tooltip: HTMLElement
): {
	mouseover: (event: MouseEvent) => void
	mousemove: (event: MouseEvent) => void
	mouseleave: () => void
} {
	let currentHighlight: SVGGraphicsElement | null = null
	let rafId: number | null = null

	function mouseover(event: MouseEvent): void {
		const eventElement = event.target as HTMLElement
		const targetShape = eventElement.closest("[id]") as SVGGraphicsElement

		if (!targetShape || targetShape === element || targetShape === currentHighlight) return

		if (currentHighlight) {
			currentHighlight.classList.remove("is-highlighted")
		}

		targetShape.classList.add("is-highlighted")
		currentHighlight = targetShape

		const muscleName = targetShape.id

		tooltip.textContent = unhyphenateCapitalize(muscleName)
		tooltip.classList.add("is-visible")
	}

	function mousemove(event: MouseEvent): void {
		if (!currentHighlight) return

		if (rafId) cancelAnimationFrame(rafId)

		rafId = requestAnimationFrame(() => {
			const parentRect = element.parentElement?.getBoundingClientRect()
			if (!parentRect) return

			// subtract parent layout boundaries from viewport cursor positions
			const x = event.clientX - parentRect.left + TOOLTIP_OFFSET
			const y = event.clientY - parentRect.top + TOOLTIP_OFFSET

			tooltip.style.transform = `translate(${x}px, ${y}px)`
		})
	}

	function mouseleave(): void {
		if (currentHighlight) {
			currentHighlight.classList.remove("is-highlighted")
			currentHighlight = null
		}

		tooltip.classList.remove("is-visible")
	}

	return { mouseover, mousemove, mouseleave }
}

function clampBoundingBox(muscleDiagram: SVGGraphicsElement): void {
	// target the main content group inside the SVG
	const contentGroup = muscleDiagram.querySelector("g") || muscleDiagram
	const bbox = contentGroup.getBBox()

	// ensure the element was rendered and measured successfully
	if (bbox.width === 0 && bbox.height === 0) return

	muscleDiagram.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
}

function prepareDiagram(muscleDiagram: SVGGraphicsElement, tooltip: HTMLElement): void {
	// the height and width must be removed in order to style them from CSS
	muscleDiagram.removeAttribute("height")
	muscleDiagram.removeAttribute("width")

	// set viewBox to the smallest box that can cover all paths
	requestAnimationFrame(() => clampBoundingBox(muscleDiagram))

	// add the event listeners to highlight hovered muscle groups
	const eventHandlers = makeSVGPathHighlighter(muscleDiagram, tooltip)

	muscleDiagram.addEventListener("mouseover", eventHandlers.mouseover)
	muscleDiagram.addEventListener("mousemove", eventHandlers.mousemove)
	muscleDiagram.addEventListener("mouseleave", eventHandlers.mouseleave)
}

export function renderMusclesDiagram(replaceAt: string): void {
	queryReplace(replaceAt, musclesDiagramTemplate)
	queryReplace("#front-placeholder", frontDiagram)
	queryReplace("#back-placeholder", backDiagram)

	const musclesDiagramFront = document.querySelector<SVGGraphicsElement>("#muscles-diagram-front")
	const musclesDiagramBack = document.querySelector<SVGGraphicsElement>("#muscles-diagram-back")
	const tooltip = document.getElementById("#svg-tooltip")

	if (!musclesDiagramFront || !musclesDiagramBack || !tooltip) return

	prepareDiagram(musclesDiagramFront, tooltip)
	prepareDiagram(musclesDiagramBack, tooltip)
}
