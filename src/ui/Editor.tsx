import React, { useEffect, useState } from 'react'
import { generateId } from '../utils/id'
import { recordAudio, stopRecording, getRecordedBlob } from '../utils/recorder'
import { encodeMp3FromBlob } from '../utils/mp3encoder'
import JSZip from 'jszip'

export default function Editor() {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  async function onStartRecord() {
    await recordAudio()
    setRecording(true)
  }

  async function onStopRecord() {
    await stopRecording()
    setRecording(false)
    const b = await getRecordedBlob()
    setAudioBlob(b)
    setAudioUrl(URL.createObjectURL(b))
  }

  async function onExportSample() {
    if (!audioBlob) {
      alert('Record a short clip first — the exporter needs audio to include in the .cn3 sample.')
      return
    }
    // encode to mp3 using the in-browser encoder
    const mp3 = await encodeMp3FromBlob(audioBlob, 22050)
    // create a short random ID
    const qid = generateId(11)

    const zip = new JSZip()
    // put a small metadata file and an audiobank and questions folder
    zip.file('metadata.nmd', JSON.stringify({ title: 'Sample course', version: '0.0.1' }))
    // audiobank
    const audioPath = `audiobank/${qid}.mp3`
    zip.file(audioPath, mp3)
    // questions (sample)
    const questions = [
      { id: qid, type: 'AudioMatch', audio: audioPath, prompt: 'Sample audio match' }
    ]
    zip.file('questions.json', JSON.stringify(questions, null, 2))

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample.cn3'
    a.click()
    URL.revokeObjectURL(url)
    alert('Exported sample.cn3 — try opening it as a zip to inspect contents.')
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <aside className="col-span-1 bg-white p-3 rounded shadow"> 
        <h3 className="font-semibold mb-2">Skills</h3>
        <div className="text-sm text-gray-600">(Tree and skill list will go here)</div>
      </aside>
      <section className="col-span-2 bg-white p-3 rounded shadow">
        <h2 className="font-semibold mb-2">Editor</h2>
        <div className="space-y-3">
          <div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2" onClick={onStartRecord} disabled={recording}>
              Start Record
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={onStopRecord} disabled={!recording}>
              Stop Record
            </button>
          </div>
          {audioUrl && (
            <div>
              <audio src={audioUrl} controls />
            </div>
          )}

          <div>
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={onExportSample}>
              Export sample .cn3 (includes MP3)
            </button>
          </div>
        </div>
      </section>

      <aside className="col-span-1 bg-white p-3 rounded shadow">
        <h3 className="font-semibold mb-2">Preview</h3>
        <div className="text-sm text-gray-600">(Live preview will show here)</div>
      </aside>
    </div>
  )
}
