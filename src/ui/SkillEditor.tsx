import React, { useState } from 'react'
import { Skill, Word, Sentence, AutomationLevelConfig, AudiobankEntry } from '../types'
import { generateId } from '../utils/id'

type Props = {
  skill: Skill
  onChange: (skill: Skill) => void
}

export default function SkillEditor({ skill, onChange }: Props) {
  const [tab, setTab] = useState<'meta'|'words'|'sentences'|'automation'>('meta')

  function update(f: (s: Skill) => void) {
    const copy = JSON.parse(JSON.stringify(skill)) as Skill
    f(copy)
    onChange(copy)
  }

  function addWord() {
    const w: Word = { id: generateId(8), target: 'new', native: 'translation' }
    update(s => s.words.push(w))
  }
  function addSentence() {
    const se: Sentence = { id: generateId(8), target: 'New sentence.', native: 'Translation.' }
    update(s => s.sentences.push(se))
  }

  async function uploadAudioForItem(itemId: string, file: File | null) {
    if (!file) return
    // use itemId as the audiobank id so it's easy to see which audio belongs to which item
    const entry: AudiobankEntry = { id: itemId, file }
    update(s => {
      // replace existing entry with same id if present
      const i = s.audiobank.findIndex(a => a.id === itemId)
      if (i >= 0) s.audiobank[i] = entry
      else s.audiobank.push(entry)

      // attach to word if exists
      const w = s.words.find(w => w.id === itemId)
      if (w) w.audioId = itemId
      const se = s.sentences.find(se => se.id === itemId)
      if (se) se.audioId = itemId
    })
  }

  function attachAudioToWord(wordId: string, audioId: string) {
    update(s => {
      const w = s.words.find(x => x.id === wordId)
      if (w) w.audioId = audioId
    })
  }

  function attachAudioToSentence(sentenceId: string, audioId: string) {
    update(s => {
      const se = s.sentences.find(x => x.id === sentenceId)
      if (se) se.audioId = audioId
    })
  }

  function setAutomationForLevel(level: number, cfg: AutomationLevelConfig) {
    update(s => { s.automation[level] = cfg })
  }

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button className={`px-3 py-1 ${tab==='meta'? 'bg-blue-600 text-white':'bg-gray-200'}`} onClick={() => setTab('meta')}>Metadata</button>
        <button className={`px-3 py-1 ${tab==='words'? 'bg-blue-600 text-white':'bg-gray-200'}`} onClick={() => setTab('words')}>Words</button>
        <button className={`px-3 py-1 ${tab==='sentences'? 'bg-blue-600 text-white':'bg-gray-200'}`} onClick={() => setTab('sentences')}>Sentences</button>
        <button className={`px-3 py-1 ${tab==='automation'? 'bg-blue-600 text-white':'bg-gray-200'}`} onClick={() => setTab('automation')}>Automation</button>
      </div>

      {tab === 'meta' && (
        <div className="bg-white p-3 rounded">
          <label className="block mb-2">Skill name
            <input className="block border p-1 w-full" value={skill.name} onChange={e => update(s => s.name = e.target.value)} />
          </label>
          <label className="block mb-2">Description
            <textarea className="block border p-1 w-full" value={skill.description || ''} onChange={e => update(s => s.description = e.target.value)} />
          </label>
          <div className="flex items-center gap-4">
            <label className="block mb-2">Levels (fixed)
              <input className="block border p-1 w-24 bg-gray-100" value={5} readOnly />
            </label>
            <label className="block mb-2">Lessons per level
              <input type="number" className="border p-1 w-24" value={skill.lessonsPerLevel} onChange={e => update(s => s.lessonsPerLevel = Math.max(1, Number(e.target.value)))} />
            </label>
          </div>
        </div>
      )}

      {tab === 'words' && (
        <div className="bg-white p-3 rounded">
          <div className="flex items-center mb-2">
            <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={addWord}>Add word</button>
          </div>
          <div>
            {skill.words.map(w => (
              <div key={w.id} className="border p-2 mb-2 rounded">
                <div className="flex gap-2">
                  <input value={w.target} onChange={e => update(s => { const x = s.words.find(z=>z.id===w.id)!; x.target = e.target.value })} className="border p-1 flex-1" />
                  <input value={w.native} onChange={e => update(s => { const x = s.words.find(z=>z.id===w.id)!; x.native = e.target.value })} className="border p-1 w-64" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-sm text-gray-600">Upload audio for this word:</label>
                  <input type="file" accept="audio/*" onChange={e => uploadAudioForItem(w.id, e.target.files ? e.target.files[0] : null)} />

                  <label className="text-sm text-gray-600 ml-4">Or attach existing:</label>
                  <select value={w.audioId || ''} onChange={e => attachAudioToWord(w.id, e.target.value)} className="ml-2 border p-1">
                    <option value="">(none)</option>
                    {skill.audiobank.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'sentences' && (
        <div className="bg-white p-3 rounded">
          <div className="flex items-center mb-2">
            <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={addSentence}>Add sentence</button>
          </div>
          <div>
            {skill.sentences.map(se => (
              <div key={se.id} className="border p-2 mb-2 rounded">
                <div className="flex gap-2">
                  <input value={se.target} onChange={e => update(s => { const x = s.sentences.find(z=>z.id===se.id)!; x.target = e.target.value })} className="border p-1 flex-1" />
                  <input value={se.native} onChange={e => update(s => { const x = s.sentences.find(z=>z.id===se.id)!; x.native = e.target.value })} className="border p-1 w-64" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-sm text-gray-600">Upload audio for this sentence:</label>
                  <input type="file" accept="audio/*" onChange={e => uploadAudioForItem(se.id, e.target.files ? e.target.files[0] : null)} />

                  <label className="text-sm text-gray-600 ml-4">Or attach existing:</label>
                  <select value={se.audioId || ''} onChange={e => attachAudioToSentence(se.id, e.target.value)} className="ml-2 border p-1">
                    <option value="">(none)</option>
                    {skill.audiobank.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'automation' && (
        <div className="bg-white p-3 rounded">
          <div className="space-y-3">
            <div className="text-sm text-gray-600">Define how many questions of each type to include per level. Empty or 0 = none.</div>
            {[1,2,3,4,5].map((level) => {
              const cfg = skill.automation[level] || {}
              return (
                <div key={level} className="border p-2 rounded">
                  <h4 className="font-semibold">Level {level}</h4>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['PickOne','Flashcard','SpellingPick','Match','AudioMatch','WriteWords','PickWords','PickOneMeaning','PickMissingWord'].map((t) => (
                      <label key={t} className="flex items-center gap-2">
                        <span className="w-36 text-sm">{t}</span>
                        <input type="number" min={0} className="border p-1 w-20" defaultValue={(cfg as any)[t] || 0} onBlur={e => {
                          const v = Math.max(0, Number(e.currentTarget.value))
                          const copy = {...cfg, [t]: v}
                          setAutomationForLevel(level, copy)
                        }} />
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
