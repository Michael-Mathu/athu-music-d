# Athu Music D

![Athu Music Logo](src/assets/logo.png)

Athu Music D is an ultra-fast, offline-first native Desktop Music Player built using **Tauri v2**, **Rust**, and **React 19**.

It features a premium, pixel-accurate recreation of the **Vinyl** music player UI, adhering strictly to the **GTK4/Libadwaita** design language for a clean, modern, and native feel on Windows and Linux.

## 🚀 Key Features

- **Adaptive Adwaita UI**: Support for Dark (`#242424`) and Light (`#FAFAFA`) modes with automatic system switching.
- **Dual-Panel Vinyl Layout**: Dedicated playback/lyrics panel and a fluid library/queue panel.
- **Interactive Synced Lyrics**:
  - **Click-to-Seek**: Jump instantly to any part of a song by clicking a lyric line.
  - **Lyrics Editor**: Built-in editor with online search and manual timestamping.
- **Library Sorting System**: Organize Tracks, Albums, and Artists by Name or Date Modified with persistent preferences.
- **Desktop Integration**:
  - **MPRIS/SMTC**: Full support for native media controls and metadata overlays.
  - **Global Hotkeys**: Control playback from anywhere in the OS.
- **High-Performance Caching**: Rust-based High-DPI cover art generation for smooth library browsing.
- **Rich Metadata**: Automatic artist biographies and album art fetching.

## 🛠️ Technology Stack

1. **Frontend**: React 19 + TypeScript + Vite.
2. **UI/Styling**: MUI v6 (configured for Libadwaita aesthetic).
3. **Backend**: Rust (Tauri v2) handling Rodio audio engine, SQLite, and image processing.
4. **Typography**: **Inter / SF Pro** for a modern, high-end desktop experience.

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
- **Typography**: Primary font is **Inter**.
- **Changelog**: See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

---
*Developed by the Athu Music Team*
