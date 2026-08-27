import React, { useEffect, useState } from 'react'
import Editor from './Editor'
import SkillEditor from './SkillEditor'
import { Course, Skill } from '../types'
import { generateId } from '../utils/id'

export default function EditorShell() {
  const [course, setCourse] = useState<Course>(() => ({ id: generateId(6), name: 'New course', skills: [] }))
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)

  useEffect(() => {
    if (course.skills.length > 0 && !selectedSkillId) setSelectedSkillId(course.skills[0].id)
  }, [course.skills])

  function createSkill() {
    const s: Skill = {
      id: generateId(8),
      name: 'New skill',
      description: '',
      imageCode: '',
      fillColor: '#a7f3d0',
      strokeColor: '#059669',
      levels: 3,
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

  return (
    <div className="grid grid-cols-4 gap-4">
      <aside className="col-span-1 bg-white p-3 rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Skills</h3>
          <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={createSkill}>+ Skill</button>
        </div>
        <div className="space-y-1">
          {course.skills.map(s => (
            <div key={s.id} className={`p-2 rounded cursor-pointer ${selectedSkillId===s.id ? 'bg-green-100': ''}`} onClick={() => setSelectedSkillId(s.id)}>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">levels: {s.levels} • words: {s.words.length}</div>
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
