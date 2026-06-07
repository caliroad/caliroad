export function queryReplace(selector, template) {
	const placeholder = document.querySelector(selector)

	if (placeholder) placeholder.outerHTML = template
}
