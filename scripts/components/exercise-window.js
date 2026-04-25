import { marked } from "https://esm.sh/marked"
import matter from "https://esm.sh/gray-matter"

const websiteLogo = document.querySelector(".logo")
const exerciseWindow = document.querySelector("#exercise-window")
const exerciseWindowCloseButton = exerciseWindow.querySelector(
	"#exercise-window .close-button"
)
const bannerTitle = exerciseWindow.querySelector(".banner h1")
const bannerImg = exerciseWindow.querySelector(".banner img")
const contentMusclesEl = exerciseWindow.querySelector(".content .muscles")
const contentFreeformEl = exerciseWindow.querySelector(".content .freeform")

websiteLogo.addEventListener("click", () => {
	exerciseWindow.showModal()
})

exerciseWindowCloseButton.addEventListener("click", () => {
	exerciseWindow.close()
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

export async function loadExercise(name) {
	const basePath = `../../exercises/${name}/`

	try {
		const res = await fetch(basePath + `exercise.md`)

		if (!res.ok) {
			throw new Error(`HTTP error: ${res.status}`)
		}

		// parse Markdown information
		const text = await res.text()
		const { data, content } = matter(text)
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
	} catch (err) {
		console.error(err)
		contentFreeformEl.innerHTML = `<p>Failed to load exercise.</p>`
	}
}

loadExercise("planche")
