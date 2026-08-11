import i18n from "i18next"
import locI18next from "loc-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { registerSetting } from "@app/components/settings-menu/main.js"
import { languageToggleConfig } from "./components/settings/main.js"

const localeFiles = import.meta.glob("/**/locales.json", { eager: true })
let localize

let resources = {}

// Helper function to build deeply nested objects from an array of path segments
function setDeepPath(targetObj, pathArray, valueObj) {
	let current = targetObj
	pathArray.forEach((segment, index) => {
		if (index === pathArray.length - 1) {
			// Safely merge values into the final object key
			current[segment] = { ...(current[segment] || {}), ...valueObj }
		} else {
			if (!current[segment]) current[segment] = {}
			current = current[segment]
		}
	})
}

// Parse file paths and inject translations deeply into the resources object
Object.entries(localeFiles).forEach(([filePath, fileModule]) => {
	const componentLocales = fileModule.default || fileModule

	// Clean path down to the relative folder path
	const cleanedPath = filePath
		.replace(/^.*\/src\//, "")
		.replace(/^\//, "")
		.replace(/^\.\//, "")
		.replace(/locales\.json$/, "")
		.replace(/\/$/, "") // remove trailing slash if present

	Object.entries(componentLocales).forEach(([lang, translations]) => {
		if (!resources[lang]) resources[lang] = { translation: {} }

		if (!cleanedPath) {
			// ROOT locales.json -> merge directly into top-level translation object
			resources[lang].translation = {
				...resources[lang].translation,
				...translations,
			}
		} else {
			// COMPONENT locales.json -> nest under path hierarchy
			const pathSegments = cleanedPath.split("/")
			setDeepPath(resources[lang].translation, pathSegments, translations)
		}
	})
})

const I18N_CONFIG = {
	fallbackLng: "en",
	debug: false,
	resources, // inject the dynamically built resources here
	detection: {
		// disables caching of active language
		caches: [],
	},
}

registerSetting(languageToggleConfig)

function getBaseLocale(locale) {
	return locale.split("-")[0]
}

function setLocale(locale) {
	if (!locale) return

	const newLocale = getBaseLocale(locale)
	i18n.changeLanguage(newLocale)
}

const handleLocaleUpdate = (lng) => {
	const newLocale = i18n.resolvedLanguage || getBaseLocale(lng)
	if (localize) localize("[data-i18n]")

	window.dispatchEvent(
		new CustomEvent("locale-updated", {
			detail: {
				locale: newLocale,
			},
		})
	)
}

function startDOMObserver() {
	if (!localize) return

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue
				localize(":scope, [data-i18n]", { document: node })
			}
		}
	})

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})
}

i18n.use(LanguageDetector)
	.init(I18N_CONFIG)
	.then(() => {
		localize = locI18next.init(i18n)
		handleLocaleUpdate(i18n.language)
		startDOMObserver()
	})

// listen to i18next's internal changes
i18n.on("languageChanged", handleLocaleUpdate)

// listen to UI dropdown requests
window.addEventListener("request-locale-change", (e) => setLocale(e.detail.locale))

// listen to browser/OS system changes
window.addEventListener("languagechange", () => setLocale(navigator.language))

let savePreferences = localStorage.getItem("savePreferences") !== null

if (savePreferences) {
	let savedLocale = localStorage.getItem("savedLocale")
	setLocale(savedLocale)
}

export default i18n
