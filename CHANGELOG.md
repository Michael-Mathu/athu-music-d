# Changelog

All notable changes to the Athu Music D project will be documented in this file.

## [0.5.0] - 2026-06-07

### Added
- **Functional Shuffle**: Shuffle now actually reorders the queue using Fisher-Yates algorithm, keeping the current track at the head.
- **Search Overlay**: Full-featured search across tracks, albums, and artists with keyboard navigation (Escape to close).
- **Minimize/Maximize Controls**: Window minimize and maximize/restore buttons added to the HeaderBar.
- **Delete Playlist**: Playlists can now be deleted via the trash icon.
- **Add to Playlist**: Tracks context menu now shows all playlists for quick addition.
- **Lyrics Editor: Save to File**: Saving now writes the LRC file alongside the audio file (e.g., `Track.mp3` → `Track.lrc`).
- **Lyrics Editor: Delete Line**: Individual lines can now be removed in the editor.
- **Settings: Change Folder & Rescan**: Both buttons are now wired up and functional.
- **NavRail Tooltips**: Each navigation icon now shows a tooltip with the view name.
- **Empty Queue State**: Queue view shows a helpful message when empty.
- **Artists Virtualization**: Artists list now uses `react-virtuoso` for smooth performance at library scale.

### Fixed
- **Light Mode**: Fixed broken light mode in Playlists, NavRail, and Settings — all hard-coded dark colors replaced with theme-aware values.
- **`CoverArtImage` Import Order**: Moved `Box` import to top of file (was at line 77 — after usage).
- **`formatDuration` in Queue**: Fixed float seconds bug — `Math.floor` now applied correctly.
- **`dangerouslySetInnerHTML` XSS Risk**: Artist bio now strips HTML tags safely instead of rendering raw HTML.
- **Cover Art Fallback Path**: Now uses a bundled import (`import logoSrc from '…'`) instead of `/src/assets/logo.png` which breaks in production builds.
- **ErrorBoundary**: Now adapts to the system color scheme instead of always showing a dark background.
- **Version Display**: Settings now correctly shows v0.5.0.

### Changed
- **App.tsx Refactor**: Extracted library state into `useLibrary` hook and playback state into `usePlayback` hook. `App.tsx` reduced from 582 to ~230 lines.
- **Caching Consolidation**: Merged the two separate `getCached`/`setCached` implementations (from `metadata.ts` and `metadataWaterfall.ts`) into one shared module.

### Removed
- **Dead Code**: Removed unused `BottomBar.tsx` (271 lines), `useArtistImage`, `fetchArtistMetadata`, `fetchArtistImage` from `metadata.ts`.
- **Dead Dependencies**: Removed `animejs`, `react-router-dom`, and `@types/animejs` from `package.json`.
- **Roboto Serif**: Removed the Google Fonts link from `index.html` (font was removed in v0.3.0 but the link remained).

---

## [0.3.0] - 2026-04-24


### Added
- **Adwaita Light Mode**: Fully implemented native-feeling light theme with automatic system-wide switching.
- **Interactive Lyrics**: Added click-to-seek functionality in the Now Playing view.
- **Synced Lyrics Editor**: New interactive editor for creating and syncing LRC files with real-time stamping.
- **Library Sorting System**: Support for sorting Tracks, Albums, and Artists by Name and Date Modified (Newest/Oldest First).
- **MPRIS & SMTC Integration**: Native media controls and metadata support for Windows and Linux.
- **High-DPI Cover Art Caching**: Rust-based thumbnail generation (300x300) for optimized library performance.
- **Global Hotkeys**: Background support for media keys (Play/Pause, Next, Previous).

### Changed
- **Typography**: Transitioned global font from Roboto Serif to **Inter / SF Pro** for a more modern OS aesthetic.
- **Performance**: Reduced memory overhead by serving cached thumbnails instead of raw high-res images in library views.
- **UI/UX**: Refined the Tracks, Albums, and Artists views with better toolbars and persistent sorting preferences.

### Technical
- Updated to **React 19** and **MUI v6**.
- Integrated `souvlaki` for cross-platform media transport.
- Extended SQLite database schema to support file modification timestamps.

## [0.2.0] - 2026-04-21

### Added
- **Vinyl UI**: Implemented the two-panel layout inspired by the Vinyl music player.
- **Libadwaita Design System**: Introduced the initial GTK4/Libadwaita aesthetic for the dark theme.
- **Library Views**: Initial implementation of Tracks, Albums, Artists, and Playlists.

### Changed
- **Architecture**: Migrated to a modular view-based routing system within the main application.

---

[0.3.0]: https://github.com/micha/athu-music-d/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/micha/athu-music-d/releases/tag/v0.2.0
