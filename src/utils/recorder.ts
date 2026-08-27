// Minimal recorder wrapper using MediaRecorder
let mediaRecorder: MediaRecorder | null = null
let recordedChunks: BlobPart[] = []

export async function recordAudio() {
  recordedChunks = []
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder = new MediaRecorder(stream)
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data)
  }
  mediaRecorder.start()
}

export async function stopRecording() {
  return new Promise<void>((resolve) => {
    if (!mediaRecorder) return resolve()
    mediaRecorder.onstop = () => resolve()
    mediaRecorder.stop()
    mediaRecorder = null
  })
}

export async function getRecordedBlob(): Promise<Blob | null> {
  if (!recordedChunks || recordedChunks.length === 0) return null
  return new Blob(recordedChunks, { type: 'audio/webm' })
}
