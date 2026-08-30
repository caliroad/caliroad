import "./styles.css"
import bannerTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"
import type { ExerciseAssets } from "@shared/types/exercise"

export function renderBanner(title: string, assets: ExerciseAssets | null | undefined): void {
	queryReplace("#banner-placeholder", bannerTemplate)

	const bannerTitle = document.querySelector<HTMLElement>("#exercise-window .banner .title")
	const bannerImg = document.querySelector<HTMLImageElement>("#exercise-window .banner img")
	const bannerAvatar = document.querySelector<HTMLImageElement>("#exercise-window .banner .avatar img")

	if (!bannerTitle || !bannerImg || !bannerAvatar) {
		console.warn("Banner container elements missing from DOM.")
		return
	}

	if (!assets) return

	bannerImg.setAttribute("src", assets.bannerUrl)
	bannerAvatar.setAttribute("src", assets.avatarUrl)
	bannerTitle.textContent = title
}
