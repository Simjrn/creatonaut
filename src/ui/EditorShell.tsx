import React, { useEffect, useState, useCallback } from 'react'
import JSZip from 'jszip'
import SkillEditor from './SkillEditor'
import { Course, Skill } from '../types'
import { generateId } from '../utils/id'
import { saveCourse, loadCourse } from '../storage/indexeddb'

export default function EditorShell() {
  const [course, setCourse] = useState<Course>(() => ({ id: generateId(6), name: 'New course', skills: [] }))
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)

  // load from IndexedDB on mount
  useEffect(() => {
    ;(async () => {
      try {
        const saved = await loadCourse()
        if (saved) {
          setCourse(saved)
          if (saved.skills && saved.skills.length > 0) setSelectedSkillId(saved.skills[0].id)
        }
      } catch (err) {
        console.warn('Failed to load course from IndexedDB', err)
      }
    })()
  }, [])

  // save to IndexedDB on every course change (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      saveCourse(course).catch(e => console.warn('Failed to save course', e))
    }, 300)
    return () => clearTimeout(id)
  }, [course])

  function createSkill() {
    const s: Skill = {
      id: generateId(8),
      name: 'New skill',
      description: '',
      imageCode: '',
      fillColor: '#a7f3d0',
      strokeColor: '#059669',
      levels: 5 as const,
      lessonsPerLevel: 3,
      words: [],
      sentences: [],
      audiobank: [],
      automation: {}
    }
    setCourse(c => ({ ...c, skills: [...c.skills, s] }))
    setSelectedSkillId(s.id)
  }

  function updateSkill(skill: Skill) {
    setCourse(c => ({ ...c, skills: c.skills.map(s => s.id === skill.id ? skill : s) }))
  }

  const onExportProject = useCallback(async () => {
    const zip = new JSZip()
    zip.file('course.json', JSON.stringify(course, null, 2))
    // attach audiobank files
    for (const skill of course.skills) {
      for (const a of skill.audiobank) {
        try {
          const file = a.file as File | Blob
          const name = (file as any).name || `${a.id}.bin`
          zip.file(`audiobank/${skill.id}/${name}`, file)
        } catch (e) {
          console.warn('Failed to attach audio', e)
        }
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${course.id || 'course'}.creatonaut.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [course])

  const onImportProjectFile = useCallback(async (file: File | null) => {
    if (!file) return
    const name = file.name.toLowerCase()
    try {
      if (name.endsWith('.json')) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        setCourse(parsed)
        if (parsed.skills && parsed.skills.length > 0) setSelectedSkillId(parsed.skills[0].id)
        return
      }
      // assume zip / cn3
      const zip = await JSZip.loadAsync(file)
      if (zip.file('course.json')) {
        const text = await zip.file('course.json')!.async('string')
        const parsed = JSON.parse(text)
        // Try to rehydrate audiobank files by matching paths
        for (const skill of parsed.skills || []) {
          skill.audiobank = skill.audiobank || []
          const files = Object.keys(zip.files).filter(p => p.startsWith(`audiobank/${skill.id}/`))
          for (const p of files) {
            const entry = zip.file(p)!
            const blob = await entry.async('blob')
            const id = p.split('/').pop()!
            skill.audiobank.push({ id, file: blob })
          }
        }
        setCourse(parsed)
        if (parsed.skills && parsed.skills.length > 0) setSelectedSkillId(parsed.skills[0].id)
        return
      }

      alert('No course.json found in zip — import aborted. For now, please export using the app to create an importable package.')
    } catch (err) {
      console.error('Import failed', err)
      alert('Import failed: ' + (err as any).message)
    }
  }, [])

  return (
    <div className="grid grid-cols-4 gap-4">
      <aside className="col-span-1 bg-white p-3 rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Skills</h3>
          <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={createSkill}>+ Skill</button>
        </div>

        <div className="mb-4">
          <button className="px-2 py-1 bg-gray-200 rounded mr-2" onClick={onExportProject}>Export project (.zip)</button>
          <label className="px-2 py-1 bg-gray-200 rounded cursor-pointer">
            Import
            <input type="file" accept=".zip,.cn3,.json" onChange={e => onImportProjectFile(e.target.files ? e.target.files[0] : null)} style={{ display: 'none' }} />
          </label>
        </div>

        <div className="space-y-1">
          {course.skills.map(s => (
            <div key={s.id} className={`p-2 rounded cursor-pointer ${selectedSkillId===s.id ? 'bg-green-100': ''}`} onClick={() => setSelectedSkillId(s.id)}>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">lessons/level: {s.lessonsPerLevel} • levels: {s.levels} • words: {s.words.length}</div>
            </div>
          ))}
        </div>
      </aside>

      <section className="col-span-2 bg-white p-3 rounded shadow">
        {selectedSkillId ? (
          <SkillEditor skill={course.skills.find(s => s.id === selectedSkillId)!} onChange={updateSkill} />
        ) : (
          <div className="text-gray-600">Select or create a skill to begin editing.</div>
        )}
      </section>

      <aside className="col-span-1 bg-white p-3 rounded shadow">
        <h3 className="font-semibold mb-2">Preview / Automation</h3>
        <div className="text-sm text-gray-600">This pane will later show lesson generation preview and automation controls.</div>
      </aside>
    </div>
  )
}
