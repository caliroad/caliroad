import "./utils/auto-theme-toggle.js"

import "./styles/main.css"

import "@features/force-graph/main.js"
import "./components/backdrop/main.js"
import "./components/info-popup/main.js"

import { registerSetting } from "./components/settings-menu/main.js"
import { themeToggleConfig } from "./components/settings-menu/components/theme-toggle/main.js"
import { preferencesToggleConfig } from "./components/settings-menu/components/preferences/main.js"
import { fullscreenToggleConfig } from "./components/settings-menu/components/fullscreen/main.js"
registerSetting(themeToggleConfig)
registerSetting(fullscreenToggleConfig)
registerSetting(preferencesToggleConfig)

import "@features/exercises/main.js"
