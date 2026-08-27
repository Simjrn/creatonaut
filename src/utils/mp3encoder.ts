// MP3 encoder helper using lamejs
import { Mp3Encoder } from 'lamejs'

async function decodeAudioData(buffer: ArrayBuffer): Promise<AudioBuffer> {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return await ctx.decodeAudioData(buffer)
}

export async function encodeMp3FromBlob(blob: Blob, outSampleRate = 22050): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioBuf = await decodeAudioData(arrayBuffer)

  // merge to mono
  const channelData = audioBuf.numberOfChannels > 1 ?
    audioBuf.getChannelData(0).map((v,i) => (audioBuf.getChannelData(0)[i] + audioBuf.getChannelData(1)[i]) / 2) :
    audioBuf.getChannelData(0)

  // resample if needed (naive linear resample)
  const sampleRate = audioBuf.sampleRate
  const ratio = sampleRate / outSampleRate
  const newLength = Math.floor(channelData.length / ratio)
  const samples = new Int16Array(newLength)
  for (let i = 0; i < newLength; i++) {
    const idx = Math.floor(i * ratio)
    const s = channelData[idx]
    const clamped = Math.max(-1, Math.min(1, s))
    samples[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
  }

  const mp3encoder = new Mp3Encoder(1, outSampleRate, 128)
  const mp3Data: Int8Array[] = []
  const sampleBlockSize = 1152
  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const chunk = samples.subarray(i, i + sampleBlockSize)
    const mp3buf = mp3encoder.encodeBuffer(chunk as any)
    if (mp3buf.length > 0) mp3Data.push(mp3buf)
  }
  const mp3buf = mp3encoder.flush()
  if (mp3buf.length > 0) mp3Data.push(mp3buf)

  // concatenate
  let totalLength = 0
  for (const x of mp3Data) totalLength += x.length
  const out = new Uint8Array(totalLength)
  let offset = 0
  for (const x of mp3Data) {
    out.set(x, offset)
    offset += x.length
  }
  return new Blob([out.buffer], { type: 'audio/mpeg' })
}
