export type AudiobankEntry = {
  id: string // unique id used to reference audio (we'll use item ids to keep them readable)
  file: File | Blob
}

export type Word = {
  id: string
  target: string
  native: string
  audioId?: string // reference into audiobank
}

export type Sentence = {
  id: string
  target: string
  native: string
  audioId?: string
}

export type AutomationLevelConfig = {
  // counts per question type
  PickOne?: number
  Flashcard?: number
  SpellingPick?: number
  Match?: number
  AudioMatch?: number
  WriteWords?: number
  PickWords?: number
  PickOneMeaning?: number
  PickMissingWord?: number
}

export type Skill = {
  id: string
  name: string
  description?: string
  imageCode?: string
  fillColor?: string
  strokeColor?: string
  // number of levels is fixed to 5 for Lingonaut courses
  levels: 5
  // lessonsPerLevel indicates how many lessons each of the 5 levels will contain
  lessonsPerLevel: number
  words: Word[]
  sentences: Sentence[]
  audiobank: AudiobankEntry[]
  automation: Record<number, AutomationLevelConfig> // level -> config
}

export type Course = {
  id: string
  name: string
  skills: Skill[]
}
