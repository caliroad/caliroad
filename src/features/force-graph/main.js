import "./styles.css"
import forceGraphTemplate from "./template.html?raw"
import ForceGraph from "force-graph"

document.querySelector("main").insertAdjacentHTML("beforeend", forceGraphTemplate)
const graphContainer = document.getElementById("force-graph")

import rawGraphData from "virtual:graph-data"

let Graph
const NODE_SIZE = 24
const NODE_LINK_DISTANCE = 40
let NODE_LABEL_LINK_COLOR
let NODE_BORDER_COLOR
let NODE_BORDER_WIDTH = 2

// compile custom HTML strings into cached Image objects
function generateHtmlNodeImage(node) {
	const img = new Image()

	const svgData = `
		<svg xmlns="http://www.w3.org/2000/svg" width="${node.width}" height="${node.height}">
			<foreignObject width="${node.width}" height="${node.height}">
				<div xmlns="http://www.w3.org/1999/xhtml" style="width:${node.width}px; height:${node.height}px; box-sizing:border-box; margin:0; padding:0; overflow:hidden;">
					${node.html}
				</div>
			</foreignObject>
		</svg>
  `

	const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
	const url = URL.createObjectURL(svgBlob)
	img.src = url

	return { ...node, img }
}

const specialNodes = {
	nodes: [
		{
			id: "special-node-1",
			url: "https://github.com/pocco81",
			html: `
				<div style="font-family:sans-serif; text-align:center; overflow-wrap:anywhere; background:linear-gradient(135deg, #667eea, #764ba2); color:white; padding:12px; border-radius:8px; width:100%; height:100%; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; align-items:center; border:2px solid #fff; box-shadow:0 4px 6px rgba(0,0,0,0.15);">
					<strong style="font-size:18px;">📚 Liking the app?</strong>
					<span style="opacity:0.9; font-size:14px; margin-top:4px">Support me at github.com/pocco81</span>
				</div>`,
			width: 125,
			height: 125,
		},
	],
}

// pre-cache images for specialNodes
specialNodes.nodes.forEach((node) => {
	const asset = generateHtmlNodeImage(node)
	node._cachedAsset = asset

	// trigger graph refresh when image loads to repaint the image
	asset.img.onload = () => {
		Graph.refresh()
	}
})

// load images for normal nodes
const hydratedNodes = rawGraphData.nodes.map((node) => {
	const img = new Image()
	img.src = node.img

	return {
		...node,
		img,
	}
})

const graphData = {
	nodes: [...specialNodes.nodes, ...hydratedNodes],
	links: [...(specialNodes?.links || []), ...rawGraphData.links],
}

function updateStyles() {
	const BODY_STYLES = getComputedStyle(document.body)
	NODE_LABEL_LINK_COLOR = BODY_STYLES.color
	NODE_BORDER_COLOR = BODY_STYLES.getPropertyValue("--light-bg-base").trim()
}

updateStyles()

window.addEventListener("auto-themechange", updateStyles)
window.addEventListener("manual-themechange", updateStyles)
window.addEventListener("resize", () => {
	Graph.width(window.innerWidth)
	Graph.height(window.innerHeight)
})

let hoveredNode = null

Graph = new ForceGraph(graphContainer)
	.graphData(graphData)
	.linkColor(() => NODE_LABEL_LINK_COLOR)
	.nodeLabel((node) => {
		let text = node.url ?? node.id

		return `<strong>${text}</strong>`
	})
	.nodeCanvasObject((node, ctx, globalScale) => {
		const asset = node._cachedAsset

		// render special nodes at exact pixel sizes
		if (asset) {
			if (asset.img.complete && asset.img.naturalWidth > 0) {
				// dividing by globalScale locks the node to exact physical screen pixels
				const screenWidth = node.width / globalScale
				const screenHeight = node.height / globalScale

				ctx.drawImage(asset.img, node.x - screenWidth / 2, node.y - screenHeight / 2, screenWidth, screenHeight)
			}
			return
		}

		// render normal nodes
		let label = node.id.toString()
		const fontSize = 20 / globalScale
		ctx.font = `${fontSize}px Questrial`
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillStyle = NODE_LABEL_LINK_COLOR

		if (node.img && node.img.complete && node.img.naturalWidth > 0) {
			ctx.drawImage(node.img, node.x - NODE_SIZE / 2, node.y - NODE_SIZE / 2, NODE_SIZE, NODE_SIZE)
		}

		ctx.fillText(label, node.x, node.y + NODE_SIZE / 1.4)

		// highlight the contour of the currently hovered node
		if (node === hoveredNode) {
			ctx.save()
			ctx.beginPath()

			ctx.arc(node.x, node.y, NODE_SIZE / 2, 0, 2 * Math.PI, false)

			ctx.strokeStyle = NODE_BORDER_COLOR
			ctx.lineWidth = NODE_BORDER_WIDTH / globalScale
			ctx.stroke()
			ctx.restore()

			ctx.fillText("", 0, 0)
		}
	})
	.nodePointerAreaPaint((node, color, ctx, globalScale) => {
		const asset = node._cachedAsset
		ctx.fillStyle = color

		if (asset) {
			const screenWidth = asset.width / globalScale
			const screenHeight = asset.height / globalScale

			ctx.fillRect(node.x - screenWidth / 2, node.y - screenHeight / 2, screenWidth, screenHeight)

			return
		}

		// fallback hitbox for normal nodes (matches nodeCanvasObject default radius)
		ctx.beginPath()
		ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI)
		ctx.fill()
	})
	.onNodeHover((node) => {
		hoveredNode = node
	})

Graph.d3Force("link").distance(NODE_LINK_DISTANCE)

function goToPage(node) {
	if (node?.url) {
		window.open(node.url, "_blank")
	} else {
		const exercise = node.id.toString()
		window.location.href = `#${exercise}`
	}
}

/*
	Issue: onNodeHover & onNodeClick not working for all nodes in Brave browser
	Source: https://github.com/vasturiano/force-graph/issues/177
	Workaround: use force-graph's node click detection and fallback to parsing
	tab coordinates over the canvas if the User Agent is Brave Browser Mobile:
	read where the user taps, assess if it was short and had virtually no panning,
	and find if it fell within the radius of a node
*/

/*
 * Check if the browser is Brave Browser using Brave's official API and
 * check if the user is using a mobile device
 * */
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

// find node at touch coordinates manually for Brave Mobile
function getNodeAtScreenCoords(clientX, clientY) {
	const graphCoords = Graph.screen2GraphCoords(clientX, clientY)
	const globalScale = Graph.zoom()

	// search backwards to hit top-rendered nodes first
	for (let i = graphData.nodes.length - 1; i >= 0; i--) {
		const node = graphData.nodes[i]
		const asset = node._cachedAsset

		if (asset) {
			const halfWidth = node.width / globalScale / 2
			const halfHeight = node.height / globalScale / 2

			if (
				graphCoords.x >= node.x - halfWidth &&
				graphCoords.x <= node.x + halfWidth &&
				graphCoords.y >= node.y - halfHeight &&
				graphCoords.y <= node.y + halfHeight
			) {
				return node
			}
		} else {
			const dx = node.x - graphCoords.x
			const dy = node.y - graphCoords.y
			const distance = Math.sqrt(dx * dx + dy * dy)

			if (distance <= NODE_SIZE) {
				return node
			}
		}
	}
	return null
}

;(async () => {
	const braveMobile = await isBraveMobile()

	if (!braveMobile) {
		Graph.onNodeClick((node) => {
			goToPage(node)
		})
	} else {
		// a valid tap is fast and has virtually no panning movement
		const TAP_MAX_DURATION_MS = 250
		const TAP_MAX_MOVEMENT_PX = 5

		let touchStartTime = 0
		let touchStartX = 0
		let touchStartY = 0
		let clickedNode = null

		function setGraphInteractions(enabled) {
			if (enabled) {
				if (clickedNode) {
					delete clickedNode.fx
					delete clickedNode.fy
				}
				Graph.d3ReheatSimulation()
			}

			Graph.enableZoomInteraction(enabled)
			Graph.enablePanInteraction(enabled)
		}

		// detect where and when the touch started
		graphContainer.addEventListener("pointerdown", (e) => {
			touchStartTime = Date.now()
			touchStartX = e.clientX
			touchStartY = e.clientY
			clickedNode = getNodeAtScreenCoords(e.clientX, e.clientY)

			if (clickedNode) {
				setGraphInteractions(false)
			}
		})

		graphContainer.addEventListener("pointermove", (e) => {
			if (!clickedNode) return

			// pin the node to the finger's position for the duration of the drag
			const { x, y } = Graph.screen2GraphCoords(e.clientX, e.clientY)
			clickedNode.fx = x
			clickedNode.fy = y
		})

		// on release, check if it was a quick "tap" and locate the node manually
		graphContainer.addEventListener("pointerup", (e) => {
			if (!clickedNode) return

			const touchDuration = Date.now() - touchStartTime
			const movementX = Math.abs(e.clientX - touchStartX)
			const movementY = Math.abs(e.clientY - touchStartY)

			setGraphInteractions(true)

			if (
				touchDuration < TAP_MAX_DURATION_MS &&
				movementX < TAP_MAX_MOVEMENT_PX &&
				movementY < TAP_MAX_DURATION_MS
			) {
				e.preventDefault()
				goToPage(clickedNode)
			}

			clickedNode = null
		})

		graphContainer.addEventListener("pointercancel", () => {
			if (!clickedNode) return

			setGraphInteractions(true)
			clickedNode = null
		})
	}
})()
