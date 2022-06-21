export const enum FillWordInfo {
  None,
  Custom,
  Chinese
}

export type Dict = {
  word: string
  sw: string
  exchange: string | OCNull
  phonetic: string | OCNull
  definition: string | OCNull
  translation: string | OCNull
  tag: string | OCNull
  collins: string | OCNull
}
