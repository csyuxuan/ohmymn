import { Addon } from "@/const"
import { renderTemplateOfNodeProperties } from "@/jsExtension/nodeProperties"
import { MbBookNote } from "@/typings"
import { openUrl, showHUD } from "@/utils/common"
import { reverseEscape, escapeDoubleQuote } from "@/utils/input"
import { getExcerptText } from "@/utils/note"
import { select } from "@/utils/popup"
import { MultipleTitlesExcerpt, WhichPartofCard } from "./typings"
import { lang } from "./lang"

async function getTitleExcerpt(
  k: string[],
  type: "title" | "excerpt",
  origin = false
) {
  const { multipleTitles, multipleExcerpts } = self.globalProfile.copysearch
  if (k.length === 0) return undefined
  switch (type === "title" ? multipleTitles[0] : multipleExcerpts[0]) {
    case MultipleTitlesExcerpt.All: {
      const r = k.join(type === "title" ? "; " : "\n")
      return origin ? [r] : k.join(r)
    }
    case MultipleTitlesExcerpt.First:
      return origin ? [k[0]] : k[0]
    default:
      if (origin) return k
      return k.length === 1
        ? k[0]
        : await select(k, Addon.title, lang.choose_you_want)
  }
}
function getCustomContent(node: MbBookNote) {
  const { customContent } = self.globalProfile.copysearch
  if (!customContent) return undefined
  const template = reverseEscape(`${escapeDoubleQuote(customContent)}`, true)
  return renderTemplateOfNodeProperties(node, template)
}
export async function getContentofOneCard(node: MbBookNote, option: number) {
  const titles = node.noteTitle?.split(/\s*[;；]\s*/) ?? []
  const excerptText = getExcerptText(node, false).ocr
  const customContent = getCustomContent(node)
  switch (option) {
    case WhichPartofCard.Title: {
      const res =
        ((await getTitleExcerpt(titles, "title")) as string) ??
        ((await getTitleExcerpt(excerptText, "excerpt")) as string) ??
        customContent
      if (res) return res
      break
    }
    case WhichPartofCard.Excerpt: {
      const res =
        ((await getTitleExcerpt(excerptText, "excerpt")) as string) ??
        ((await getTitleExcerpt(titles, "title")) as string) ??
        customContent
      if (res) return res
      break
    }
    case WhichPartofCard.Custom: {
      const res =
        customContent ??
        ((await getTitleExcerpt(titles, "title")) as string) ??
        ((await getTitleExcerpt(excerptText, "excerpt")) as string)
      if (res) return res
      break
    }
    default: {
      const list = [
        ...((await getTitleExcerpt(titles, "title", true)) ?? []),
        ...((await getTitleExcerpt(excerptText, "excerpt", true)) ?? [])
      ]
      if (customContent) list.push(customContent)
      if (list.length === 1) return list[0]
      else return await select(list, Addon.title, lang.choose_you_want)
    }
  }
}
export function getContentofMuiltCards(nodes: MbBookNote[], option: number) {
  switch (option) {
    case 0: {
      const { multipleTitles } = self.globalProfile.copysearch
      return nodes.reduce((acc, cur) => {
        const t = cur.noteTitle
        if (!t) return acc
        if (multipleTitles[0] === MultipleTitlesExcerpt.First)
          acc.push(t.split(/\s*[;；]\s*/)[0])
        else acc.push(t)
        return acc
      }, [] as string[])
    }
    case 1: {
      const { multipleTitles } = self.globalProfile.copysearch
      return nodes.reduce((acc, cur) => {
        const l = getExcerptText(cur, false).ocr
        if (!l.length) return acc
        if (multipleTitles[0] === MultipleTitlesExcerpt.First) acc.push(l[0])
        else acc.push(l.join("\n"))
        return acc
      }, [] as string[])
    }
    default:
      return nodes.reduce((acc, cur) => {
        const t = getCustomContent(cur)
        t && acc.push(t)
        return acc
      }, [] as string[])
  }
}
export async function search(text: string, option: number) {
  const {
    searchAcademic,
    searchChineseText,
    searchEnglishText,
    searchOtherText,
    searchQuestion,
    searchTranslation,
    searchWord
  } = self.globalProfile.copysearch
  const searchEngine = [
    searchChineseText,
    searchEnglishText,
    searchWord,
    searchTranslation,
    searchAcademic,
    searchQuestion,
    searchOtherText
  ][option]
  if (searchEngine) openUrl(searchEngine.replace("{{keyword}}", text))
  else showHUD(lang.hud.no_search_engine_url, 2)
}
