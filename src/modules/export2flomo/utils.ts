import { renderTemplateOfNodeProperties } from "@/jsExtension/nodeProperties"
import { MbBookNote } from "@/typings"
import { reverseEscape } from "@/utils/input"
import fetch from "@/utils/network"
import { removeHighlight } from "@/utils/note"
import { AddTags } from "./typings"

export function getContent(node: MbBookNote, option: number) {
  const {
    flomoTemplate1,
    flomoTemplate2,
    flomoTemplate3,
    tagTemplate,
    addTags
  } = self.globalProfile.export2flomo
  const list = [flomoTemplate1, flomoTemplate2, flomoTemplate3].reduce(
    (acc, cur) => {
      if (cur) {
        const tags = (() => {
          if (addTags[0] === AddTags.CardTags) {
            return renderTemplateOfNodeProperties(
              node,
              "{{#tags}}#{{.}} {{/tags}}"
            )
          } else if (addTags[0] === AddTags.Custom && tagTemplate) {
            return renderTemplateOfNodeProperties(
              node,
              reverseEscape(tagTemplate, true)
            )
          }
        })()
        const main = renderTemplateOfNodeProperties(
          node,
          reverseEscape(cur, true)
        )
        const c = removeHighlight(main + "\n" + (tags ?? "")).trim()
        if (c) acc.push(c)
      }
      return acc
    },
    [] as string[]
  )
  return list[option]
}
export async function exportByAPI(content: string) {
  const { flomoAPI } = self.globalProfile.export2flomo
  const res = (await fetch(flomoAPI, {
    method: "POST",
    json: {
      content
    }
  }).then(res => res.json())) as {
    message: string
    code: number
  }
  if (res.code !== 0) throw res.message
}
