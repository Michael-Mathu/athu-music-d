# Athu Music D: Project Handover Document

## Project Overview
**Athu Music D** is an ultra-fast, offline-first native Desktop Music Player built using **Tauri v2**, **Rust**, and **React 19**. It features a pixel-accurate recreation of the **Vinyl** music player UI, adhering strictly to the **GTK4/Libadwaita** design language.

## Latest Updates (as of v0.2.0)
- **Vinyl UI Overhaul**: Transitioned to a two-panel layout (Left: Player/Lyrics, Right: Navigable Library/Queue).
- **Adwaita Aesthetic**: Implemented flat surfaces, subtle borders, and specific color palettes (#242424 / #2A2A2A).
- **Stability Fixes**: Added a global `ErrorBoundary`, a safe `ThemeContext` with localStorage guards, and a robust `AppContent` provider pattern.
- **Typography**: Updated to **Roboto Serif** globally for a refined, premium feel.
- **Logo Integration**: Integrated the new **ATHU MUSIC** logo in the HeaderBar and as a fallback for missing album art.
- **Library Integration**: Successfully merged Tracks, Albums, Artists, Playlists, and Settings into the new navigable structure.

## Technology Stack
- **Framework**: [Tauri v2](https://tauri.app/) (Rust backend, React frontend).
- **Frontend**: [React 19](https://reactjs.org/) + [Vite](https://vitejs.dev/).
- **UI & Theming**: [MUI v6](https://mui.com/) with a custom **Libadwaita** design system.
- **Typography**: Roboto Serif.
- **Backend**: Rust (Rodio for audio, Lofty for metadata).

## Design System (Vinyl/Libadwaita)
- **Accent Color**: Adwaita Blue (`#3584E4`), user-configurable.
- **Radii**: 12px for window/containers, 6px for buttons/inputs, 4px for rows.
- **Surfaces**: No drop shadows or gradients. Flat colors with 0.5px borders (`rgba(255,255,255,0.08)`).
- **Layout**: Fixed 320px left panel, fluid right panel with icon-only `NavRail` at the top.

## File Architecture
- `src/App.tsx`: Main logic, layout shell, and view routing.
- `src/lib/ThemeContext.tsx`: Safe theme and accent color state.
- `src/theme/index.ts`: MUI theme definitions and component overrides.
- `src/components/ErrorBoundary.tsx`: Global error handling.
- `src/components/layout/HeaderBar.tsx`: Draggable header with window controls and logo.
- `src/components/layout/NavRail.tsx`: Icon-only navigation for the right panel.
- `src/views/NowPlaying.tsx`: Main playback and lyrics view.
- `src-tauri/tauri.conf.json`: Tauri configuration and versioning.

## Deployment & Builds
The project uses **GitHub Actions** for automated releases.
1. Update version in `package.json` and `src-tauri/tauri.conf.json`.
2. Tag the repository: `git tag v0.2.0 && git push --tags`.
3. The release workflow will build and attach binaries for Windows and Linux.

---
*Updated by Athu Music D AI Assistant • April 21, 2026*
