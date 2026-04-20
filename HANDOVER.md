# Athu Music D: Project Handover Document

## Project Overview
**Athu Music D** is a high-performance, premium Windows music player built using **Tauri** and **React**. The application focuses on an offline-first experience with advanced metadata integration and a modern **Material You (MD3)** design language.

## Technology Stack
- **Framework**: [Tauri](https://tauri.app/) (Rust backend for system access, React frontend).
- **Frontend**: [React 18+](https://reactjs.org/) + [Vite](https://vitejs.dev/).
- **UI Library**: [Material UI (MUI) v6](https://mui.com/) with a custom Material Design 3 engine.
- **State Management**: React Context (Theme, Library).
- **Navigation**: [React Router v6](https://reactrouter.com/).
- **Icons**: [Material Icons](https://mui.com/material-ui/material-icons/).

## Key Features

### 1. Material You (MD3) Interface
The application features a fully dynamic theme system:
- **Dynamic Theming**: Users can toggle between **Light** and **Dark** modes and choose a custom primary accent color from a full color picker.
- **Navigation Rail**: Modern sidebar with pill-shaped indicators for an intuitive desktop experience.
- **Glassmorphism**: The playback bar uses backdrop blurring and surface container tokens for a premium feel.

### 2. Intelligent Metadata Scraping
Athu Music D automatically fills in the gaps for your local library:
- **Artist Images**: Automatically fetches artist profile pictures and biographies from **Wikipedia** on the fly.
- **Synced Lyrics**: Supports fetching and displaying synchronized lyrics for tracks in the "Tracks" view.
- **Caching**: All fetched metadata (images, bios) is cached locally to reduce network usage and ensure instant loading.

### 3. Music Management
- **Local Scanning**: Recursively scans user-defined Windows folders for music files (MP3, FLAC, M4A, etc.).
- **Immersive Details**: Album and Artist detail pages feature immersive blurred background canvases generated from cover art.
- **Playlist & Queue**: Full support for creating local playlists and managing a dynamic playback queue.

## File Architecture

### Core Files
- `src/App.tsx`: Main application shell, routing, and state orchestration.
- `src/lib/ThemeContext.tsx`: Manages the dynamic MD3 theme state and persistence.
- `src/theme/index.ts`: The dynamic MUI theme generator (MD3 logic).
- `src/lib/tauri.ts`: The bridge between the React frontend and the Rust backend.
- `src/lib/metadata.ts`: Multi-source scraper for artist images and metadata.

### View Components (`src/views/`)
- `Tracks.tsx`: Library scanning, track listing, and lyrics/bio panel.
- `Artists.tsx`: Grid view of all scanned artists with dynamic Wikipedia images.
- `ArtistDetails.tsx`: Hero view of an artist with high-res images and biography.
- `Albums.tsx`: Visual grid of albums with 24px border radii and hover animations.
- `Settings.tsx`: Central hub for theme customization and metadata configuration.
- `NowPlaying.tsx`: Immersive, full-screen playback environment.

## Running the Project

### Prerequisites
- [Rust & Cargo](https://rustup.rs/)
- [Node.js](https://nodejs.org/)

### Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in development mode:
   ```bash
   npm run tauri dev
   ```

### Building for Windows
To generate a standalone `.exe`:
```bash
npm run tauri build
```

## Potential Next Steps
- **Audio Visualization**: Implement a canvas-based frequency visualizer in the Now Playing view.
- **Last.fm/Fanart.tv API Keys**: Add fields in Settings to allow users to provide their own keys for higher-resolution images.
- **WASAPI Audio Output**: Explore lower-latency audio drivers in the Rust backend.

---
*Created by Antigravity AI • 2026*
