I updated the project to add a skill editing layout: SkillEditor with tabs for Metadata, Words, Sentences, and Automation. I added Course/Skill/Word/Sentence types and a SkillEditor UI.

Files added/updated:
- src/types.ts (data model)
- src/ui/SkillEditor.tsx (new: the tabbed skill editor)
- src/ui/EditorShell.tsx (new: skill tree + editor container)
- src/ui/AppEditor.tsx (new wrapper)
- src/App.tsx (replaced to use AppEditor)

Functionality now included in the prototype:
- Create skills, edit metadata (name, description, levels)
- Add words and sentences; upload audio into the skill audiobank and attach audio to words/sentences
- Automation tab to configure per-level counts for each question type

Next steps: implement the automation engine (lesson generation) and update the exporter to copy audio and produce the .cn3 structure according to the schema. Let me know if you want me to implement automated lesson generation and a full exporter next — I can do that in the next push.
