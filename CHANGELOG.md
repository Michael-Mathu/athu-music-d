# Changelog

All notable changes to the Athu Music D project will be documented in this file.

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
