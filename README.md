# Athu Music D

![Athu Music Logo](src/assets/logo.png)

Athu Music D is an ultra-fast, offline-first native Desktop Music Player built using Tauri v2, Rust, and React 19.

It features a premium, pixel-accurate recreation of the **Vinyl** music player UI, adhering strictly to the **GTK4/Libadwaita** design language for a clean, modern, and native feel on Windows and Linux.

## 🚀 Key Features

- **Dual-Panel Vinyl UI**: A dedicated left panel for playback and synced lyrics, and a navigable right panel for library management.
- **Libadwaita Aesthetic**: Dark-themed, flat surfaces with subtle 0.5px borders, rounded corners (12px), and a focus on content over chrome.
- **Full Library Management**:
  - **Tracks**: Local file scanning and metadata parsing.
  - **Albums**: Grid and detail views with cover art support.
  - **Artists**: Artist biographies fetched from Wikipedia/Last.fm.
  - **Playlists**: Create and manage custom music collections.
- **Stability Features**: Global Error Boundary, safe Theme Context with system theme sync, and robust state persistence.
- **Synced Lyrics**: Support for embedded and sidecar LRC files.
- **Performance**: Built on Tauri v2 for minimal memory footprint and native performance.

## 🛠️ Technology Stack

1. **Frontend**: React 19 + TypeScript + Vite.
2. **UI/Styling**: MUI v6 (configured for Libadwaita aesthetic) + Vanilla CSS.
3. **Backend**: Rust (Tauri v2) handling file I/O, SQLite database, and audio playback.
4. **Typography**: Roboto Serif for a refined, serif-based readability.

## 💻 Development & Build Setup

### Prerequisites
- Node.js v20+
- Rust Toolchain (Cargo / rustc)
- Windows: C++ Build Tools (MSVC)
- Linux: `libadwaita-1-dev`, `webkit2gtk-4.1-dev`

### Running Debug Mode
```bash
npm install
npm run tauri dev
```

### Compiling Executable
```bash
npm run tauri build
```
The resulting binary will be located in `src-tauri/target/release/`.

## 🎨 Design System
The application uses a custom theme implementation in `src/theme/index.ts` and `src/lib/ThemeContext.tsx`.
- **Accent Color**: Defaults to Adwaita Blue (`#3584E4`), configurable in Settings.
- **Surface Colors**: Dark mode uses `#242424` for the left panel and `#2A2A2A` for the right panel.
- **Typography**: Primary font is **Roboto Serif**.
