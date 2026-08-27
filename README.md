# Creatonaut

Creatonaut is a browser-only (PWA) authoring tool to build Lingonaut .cn3 packages locally.

This repository contains an initial scaffold (React + TypeScript + Vite) with:

- PWA manifest
- Basic editor shell (skills tree, editor, preview)
- Audio recording + in-browser MP3 encoding (lamejs)
- Sample exporter that produces a .cn3 (zip) including the generated MP3 file

Run locally:

- npm install
- npm run dev

This is the first scaffolded prototype. Next steps:

1. Reverse-engineer the Romansh .cn3 to derive the exact package schema and question JSON formats.
2. Implement full editors for all question types you supplied.
3. Implement the automation engine (per-level counts, fully-random assignment), audio bank management, and robust exporter to match Lingonaut .cn3 layout.

License: MIT
