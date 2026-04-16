# Athu Music D

Athu Music D is an ultra-fast, offline-first native Desktop Music Player built using Tauri, Rust, and React. 

Designed for incredible performance and premium visual aesthetics, Athu Music D manages large local music libraries seamlessly without relying on streaming subscription limits.

## 🚀 Key Features

*   **Immersive Now Playing View**: High quality reactive visual design with full-bleed dynamically blurred album artwork covering your entire OS window.
*   **Synced Lyrics**: Embedded MP3 tag and sidecar `.lrc` synchronization support built directly into the UI.
*   **Wikipedia Integration**: Deep discography and artist fact-scraping baked into the library views.
*   **Global OS Hardware Sync**: Interacts deeply with Windows hardware media keys safely tracking your play queue in the background.

## 🛠️ Technology Stack

1.  **Frontend**: React 19 + TypeScript + Vite.
2.  **UI/Styling**: `@mui/material` for strict, highly animated interface styling. 
3.  **Backend Daemon**: Rust `Tauri` v2 daemon handling aggressive offline SQLite `rusqlite` database pooling and native OS hooks.
4.  **Audio Engine**: `rodio` library mapping system sink buffers alongside `lofty` ID3v2 tag parsing.
5.  **Global Keys**: `souvlaki` crate bound manually to Windows D-Bus/SMTC interfaces.

## 💻 Development & Build Setup

### Prerequisites
*   Node.js v20+
*   Rust Toolchain (Cargo / rustc)
*   Windows Native MSVC Build Tools.

### Running Debug Mode
To run a temporary development application window spanning the Vite hot-reloading context:
```bash
npm install
npm run tauri dev
```

### Compiling Executable Beta
To permanently bake a highly optimized, LTO-enabled rust release `athu-music-d.exe` binary:
```bash
npm run tauri build
```
Once complete, the raw binary `.exe` will map towards `src-tauri/target/release/athu-music-d.exe` and the `.msi` setup installer will populate within `bundle/nsis/`.
