import "./styles.css"
import bannerTemplate from "./template.html?raw"
import { queryReplace } from "@shared/utils/query-replace"

export function renderBanner(title, assets) {
	queryReplace("#banner-placeholder", bannerTemplate)

	const bannerTitle = document.querySelector("#exercise-window .banner .title")
	const bannerImg = document.querySelector("#exercise-window .banner img")
	const bannerAvatar = document.querySelector("#exercise-window .banner .avatar img")

	if (!bannerTitle || !bannerImg || !bannerAvatar) {
		console.warn("Banner container elements missing from DOM.")
		return
	}

	if (!assets) return

	bannerImg.setAttribute("src", assets.bannerUrl)
	bannerAvatar.setAttribute("src", assets.avatarUrl)
	bannerTitle.textContent = title
}
