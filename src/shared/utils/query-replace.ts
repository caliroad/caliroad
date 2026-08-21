export function queryReplace(selector: string, template: string): void {
	const placeholder = document.querySelector(selector)

	if (placeholder) placeholder.outerHTML = template
}
