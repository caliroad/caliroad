export function unhyphenateCapitalize(longWord) {
	return longWord
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
}
