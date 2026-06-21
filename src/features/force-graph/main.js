import "./styles.css"
import forceGraphTemplate from "./template.html?raw"
import ForceGraph from "force-graph"

document.querySelector("main").insertAdjacentHTML("beforeend", forceGraphTemplate)
const graphContainer = document.getElementById("force-graph")

import rawGraphData from "virtual:graph-data"

const hydratedNodes = rawGraphData.nodes.map((node) => {
	const img = new Image()
	img.src = node.img

	return {
		...node,
		img,
	}
})

const graphData = {
	nodes: hydratedNodes,
	links: rawGraphData.links,
}

let TEXT_COLOR
let BORDER_COLOR

function updateStyles() {
	const BODY_STYLES = getComputedStyle(document.body)
	TEXT_COLOR = BODY_STYLES.color
	BORDER_COLOR = BODY_STYLES.getPropertyValue("--light-bg-base").trim()
}

updateStyles()
const NODE_SIZE = 12
const ZOOM = [2, 8]

let hoveredNode = null

const graph = new ForceGraph(document.getElementById("force-graph"))
	.graphData(graphData)
	.zoom((ZOOM[0] + ZOOM[1]) / 2)
	.minZoom(ZOOM[0])
	.maxZoom(ZOOM[1])
	.nodeLabel((node) => `<strong>${node.id}</strong>`)
	.nodeCanvasObjectMode(() => "replace") // replaces the default sphere/circle
	.nodeVal(NODE_SIZE / 4) // hitbox radius
	.linkColor(() => TEXT_COLOR)
	.nodeCanvasObject((node, ctx, globalScale) => {
		let label = node.id.toString()
		const fontSize = 20 / globalScale
		const font = `${fontSize}px Questrial`

		ctx.font = font
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillStyle = TEXT_COLOR

		if (node === hoveredNode) {
			ctx.save()
			ctx.beginPath()

			ctx.arc(node.x, node.y, NODE_SIZE / 2, 0, 2 * Math.PI, false)

			ctx.strokeStyle = BORDER_COLOR
			ctx.lineWidth = 3 / globalScale
			ctx.stroke()
			ctx.restore()

			ctx.fillText("", 0, 0)
			label = ""
		}

		ctx.drawImage(node.img, node.x - NODE_SIZE / 2, node.y - NODE_SIZE / 2, NODE_SIZE, NODE_SIZE)
		ctx.fillText(label, node.x, node.y + NODE_SIZE / 1.4)
	})
	.onNodeHover((node) => {
		hoveredNode = node
	})

window.addEventListener("auto-themechange", updateStyles)
window.addEventListener("manual-themechange", updateStyles)

function goToExercise(node) {
	const exercise = node.id.toString()
	window.location.href = `#${exercise}`
}

/*
	Issue: onNodeHover & onNodeClick not working for all nodes in Brave browser
	Source: https://github.com/vasturiano/force-graph/issues/177
	Workaround: use force-graph's node click detection and fallback to parsing
	tab coordinates over the canvas if the User Agent is Brave Browser Mobile:
	read where the user tabs, assess if it was short and had virtually no panning,
	and find if it fell within the radius of a node
*/

/*
 * Check if the browser is Brave Browser using Brave's official API and
 * check if the user is using a mobile device */
async function isBraveMobile() {
	// @ts-ignore
	const isBrave = !!(navigator.brave && (await navigator.brave.isBrave()))

	const isMobile =
		// @ts-ignore
		navigator.userAgentData?.mobile ||
		// fallback for older browsers using regex matching
		/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

	return isBrave && isMobile
}

if (!isBraveMobile()) {
	graph.onNodeClick((node) => {
		goToExercise(node)
	})
} else {
	let touchStartTime = 0
	let touchStartX = 0
	let touchStartY = 0

	// detect where and when the touch started
	graphContainer.addEventListener("pointerdown", (e) => {
		touchStartTime = Date.now()
		touchStartX = e.clientX
		touchStartY = e.clientY
	})

	// on release, check if it was a quick "tap" and locate the node manually
	graphContainer.addEventListener("pointerup", (e) => {
		const touchDuration = Date.now() - touchStartTime
		const movementX = Math.abs(e.clientX - touchStartX)
		const movementY = Math.abs(e.clientY - touchStartY)

		// a valid tap is fast (under 250ms) and has virtually no panning movement (under 5px)
		if (touchDuration < 250 && movementX < 5 && movementY < 5) {
			// convert screen client coordinates (clientX, clientY) to
			// the graph's internal 2D physics coordinates (x, y)
			const graphCoords = graph.screen2GraphCoords(e.clientX, e.clientY)

			// find if a node was close to those exact coordinates
			const clickTolerance = NODE_SIZE
			const clickedNode = graphData.nodes.find((node) => {
				const dx = node.x - graphCoords.x
				const dy = node.y - graphCoords.y
				const distance = Math.sqrt(dx * dx + dy * dy)

				return distance < clickTolerance
			})

			if (clickedNode) {
				// prevent double-firing if the native click also happens to work
				// this could happen if the user had disabled the Fingerprint Protection
				// shield in Brave Browser Mobile's settings
				e.preventDefault()
				goToExercise(clickedNode)
			}
		}
	})
}
