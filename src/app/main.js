import "./utils/auto-theme-toggle.js"

import "./styles/main.css"

import "./components/backdrop/main.js"
import "./components/info-popup/main.js"

import { registerSetting } from "./components/settings-menu/main.js"
import { themeToggleConfig } from "./components/settings-menu/components/theme-toggle/main.js"
import { preferencesToggleConfig } from "./components/settings-menu/components/preferences/main.js"
registerSetting(themeToggleConfig)
registerSetting(preferencesToggleConfig)

import "@features/exercises/main.js"
