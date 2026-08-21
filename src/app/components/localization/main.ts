import i18n, { type InitOptions, type Resource } from "i18next"
// @ts-expect-error loc-i18next lacks type definitions
import locI18next from "loc-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { registerSetting } from "@app/components/settings-menu/main.js"
import { languageToggleConfig } from "./components/settings/main.js"

type Dictionary<T = any> = Record<string, T>

// type for the localize function returned by loc-i18next
// prettier-ignore
type LocalizeFn = (
  selector: string,
  options?: { document?: Document | Element }
) => void;

// type for the dynamically imported locale files
// prettier-ignore
type LocaleModules = Dictionary<{ default?: Dictionary } & Dictionary>

const localeFiles = import.meta.glob("/**/locales.json", { eager: true }) as LocaleModules
let localize: LocalizeFn | undefined

// build nested resources: { [lang]: { translation: { ... } } }
const resources: Resource = {}

/**
 * Helper to build deeply nested objects from an array of path segments.
 * Merges valueObj into the final object key.
 */
function setDeepPath(targetObj: Dictionary, pathArray: string[], valueObj: Dictionary): void {
	let current = targetObj
	pathArray.forEach((segment, index) => {
		if (index === pathArray.length - 1) {
			// safely merge values into the final object key
			current[segment] = { ...(current[segment] || {}), ...valueObj }
		} else {
			if (!current[segment]) current[segment] = {}
			current = current[segment]
		}
	})
}

// parse file paths and inject translations deeply into the resources object
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
			resources[lang].translation = {
				...(resources[lang].translation as object),
				...translations,
			}
		} else {
			const pathSegments = cleanedPath.split("/")
			setDeepPath(resources[lang].translation as Dictionary, pathSegments, translations)
		}
	})
})

const I18N_CONFIG: InitOptions = {
	fallbackLng: "en",
	debug: false,
	resources, // inject the dynamically built resources here
	detection: {
		// disables caching of active language
		caches: [],
	},
}

registerSetting(languageToggleConfig)

function getBaseLocale(locale: string): string {
	return locale.split("-")[0]
}

function setLocale(locale: string | undefined): void {
	if (!locale) return
	const newLocale = getBaseLocale(locale)
	i18n.changeLanguage(newLocale)
}

const handleLocaleUpdate = (lng: string): void => {
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

function startDOMObserver(): void {
	if (!localize) return

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue
				if (localize) localize(":scope, [data-i18n]", { document: node as Element })
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
		localize = locI18next.init(i18n) as LocalizeFn
		handleLocaleUpdate(i18n.language)
		startDOMObserver()
	})

// listen to i18next's internal changes
i18n.on("languageChanged", handleLocaleUpdate)

// listen to UI dropdown requests
window.addEventListener("request-locale-change", (e: Event) => {
	const customEvent = e as CustomEvent<{ locale: string }>
	setLocale(customEvent.detail.locale)
})

// listen to browser/OS system changes
window.addEventListener("languagechange", () => setLocale(navigator.language))

const savePreferences = localStorage.getItem("savePreferences") !== null

if (savePreferences) {
	const savedLocale = localStorage.getItem("savedLocale")
	setLocale(savedLocale ?? undefined)
}

export default i18n
