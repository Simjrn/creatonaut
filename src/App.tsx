import React, { useState } from 'react'
import Editor from './ui/Editor'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-green-600 text-white p-4">
        <div className="max-w-6xl mx-auto">Creatonaut — Lingonaut course authoring (PWA)</div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Editor />
      </main>
    </div>
  )
}
