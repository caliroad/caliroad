export function unhyphenateCapitalize(longWord: string): string {
	return longWord
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
}
