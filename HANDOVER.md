# Athu Music D: Project Handover Document

## Project Overview
**Athu Music D** is an ultra-fast, offline-first native Desktop Music Player built using **Tauri v2**, **Rust**, and **React 19**. It features a pixel-accurate recreation of the **Vinyl** music player UI, adhering strictly to the **GTK4/Libadwaita** design language.

## Latest Updates (as of v0.3.0)
- **Global Typography Transition**: Switched to **Inter / SF Pro** globally for a modern, high-end OS feel, replacing the previous Roboto Serif.
- **Adaptive Theme System**: Implemented a full **Adwaita Light Mode** (`#FAFAFA`) with pixel-accurate surface colors and shadows. The app now supports automatic system theme switching via `ThemeContext`.
- **Desktop Integration (MPRIS & SMTC)**: Consolidated native media controls. The player now supports cross-platform media keys (Play/Pause, Seek, Metadata) and system-level media overlays on Windows and Linux.
- **Library Sorting System**: Added a persistent sorting system for Tracks, Albums, and Artists. Users can sort by **Name (A-Z)** or **Date Modified (Newest First)**. Preferences are stored independently per view in `localStorage`.
- **Interactive Lyrics Engine**:
  - **Click-to-Seek**: Clicking any line in the synced lyrics view instantly jumps the player to that timestamp.
  - **Lyrics Editor**: A new dedicated view for creating/adjusting LRC files, featuring real-time timestamp stamping and integrated online lyrics search.
- **High-DPI Cover Art Caching**: Implemented a Rust-based thumbnail generation system (300x300 JPEGs) to significantly reduce memory overhead and improve library scrolling performance.

## Technology Stack
- **Framework**: [Tauri v2](https://tauri.app/) (Rust backend, React frontend).
- **Frontend**: [React 19](https://reactjs.org/) + [Vite](https://vitejs.dev/).
- **UI & Theming**: [MUI v6](https://mui.com/) with a custom **Libadwaita** design system.
- **Typography**: Inter / SF Pro (via Fontsource).
- **Backend**: Rust (Rodio for audio, Lofty for metadata, Souvlaki for SMTC/MPRIS).
- **Plugins**: `tauri-plugin-global-shortcut`, `tauri-plugin-shell`.

## Design System (Vinyl/Libadwaita)
- **Accent Color**: Adwaita Blue (`#3584E4`), user-configurable.
- **Radii**: 12px for window/containers, 8px for buttons/inputs, 4px for rows.
- **Surfaces**: 
  - **Dark**: Flat surfaces with 0.5px borders (`rgba(255,255,255,0.08)`).
  - **Light**: Crisp white backgrounds (`#FAFAFA`) with subtle 0.5px borders and soft 0 2px 8px shadows for card elements.
- **Layout**: Fixed 320px left panel, fluid right panel with icon-only `NavRail` at the top.

## File Architecture
- `src/App.tsx`: Main logic, layout shell, and view routing.
- `src/lib/ThemeContext.tsx`: Safe theme and accent color state (handles 'light', 'dark', 'system').
- `src/theme/index.ts`: MUI theme definitions, including the new `Adwaita Light` variant.
- `src/hooks/useSort.ts`: Persistent sorting state management.
- `src/lib/utils/sorting.ts`: Generic sorting logic for library items.
- `src/views/NowPlaying.tsx`: Main playback and interactive synced lyrics view.
- `src/views/LyricsEditor.tsx`: Advanced synced lyrics editing and online search.
- `src-tauri/src/mpris_smtc.rs`: Native desktop media integration.
- `src-tauri/src/thumbnail_cache.rs`: High-DPI image processing and caching.

## Deployment & Builds
The project uses **GitHub Actions** for automated releases.
1. Update version in `package.json` and `src-tauri/tauri.conf.json`.
2. Tag the repository: `git tag v0.3.0 && git push --tags`.
3. The release workflow will build and attach binaries for Windows and Linux.

---
*Updated by Athu Music D AI Assistant • April 24, 2026*
