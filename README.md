<p align="center">
  <img src="src/assets/logo.png" alt="Athu Music D Logo" width="160" />
</p>

<h1 align="center">Athu Music D</h1>

<p align="center">
  <strong>An ultra-fast, offline-first desktop music player</strong><br />
  Built with Tauri v2 • Rust • React 19
</p>

<p align="center">
  <a href="https://github.com/Michael-Mathu/athu-music-d/releases"><img src="https://img.shields.io/github/v/release/Michael-Mathu/athu-music-d?include_prereleases&style=flat-square&color=%233584E4" alt="Latest Release" /></a>
  <a href="https://github.com/Michael-Mathu/athu-music-d/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" /></a>
  <a href="https://github.com/Michael-Mathu/athu-music-d/releases"><img src="https://img.shields.io/github/downloads/Michael-Mathu/athu-music-d/total?style=flat-square&color=%233584E4" alt="Downloads" /></a>
  <a href="https://github.com/Michael-Mathu/athu-music-d/actions"><img src="https://img.shields.io/github/actions/workflow/status/Michael-Mathu/athu-music-d/release.yml?style=flat-square" alt="Build Status" /></a>
  <br />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux-blue?style=flat-square" alt="Platform Support" />
  <img src="https://img.shields.io/badge/tauri-v2-FFA131?style=flat-square" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/rust-1.77%2B-DEA584?style=flat-square&logo=rust" alt="Rust" />
</p>

---

## ✦ About

Athu Music D is a high-performance desktop music player that puts your local library first. With a meticulously crafted **Vinyl-inspired dual‑panel layout** and full compliance with the **GTK4 / Libadwaita** design language, it delivers a premium, native‑feeling experience on **Windows** and **Linux**.

Every pixel has been considered — from the 12 px rounded surfaces and subtle 0.5 px borders to the adaptive light / dark colour system powered by Adwaita Blue. Under the hood, a Rust audio engine (Rodio) and SQLite-backed library ensure instant startup, smooth scrolling, and minimal memory usage.

---

## ✦ Preview

<p align="center">
  <em>Screenshots coming soon — stay tuned!</em>
</p>

| Dark Mode | Light Mode |
|:---------:|:----------:|
| • | • |

---

## ✦ Key Features

### 🎵 Playback & Lyrics
- **Dual‑Panel Layout** — Fixed 320 px left panel for Now Playing and synced lyrics; fluid right panel for library browsing.
- **Interactive Synced Lyrics** — Click any line to **instantly seek** to that position in the song.
- **Built‑in Lyrics Editor** — Create or fine‑tune LRC files with real‑time timestamp stamping while the track plays.
- **Automatic Lyrics Download & Embedding** — Fetch synced lyrics from online providers and embed them directly into your audio files (ID3v2 USLT / Vorbis Comments).
- **Gapless Playback Engine** — Powered by Rust's Rodio for low‑latency, accurate audio.

### 📚 Library Management
- **Full Hierarchy** — Browse by Tracks, Albums, Artists, and custom Playlists.
- **Smart Sorting** — Sort any view by **Name (A–Z / Z–A)** or **Date Modified (Newest / Oldest First)**. Preferences persist per view.
- **Rich Metadata** — Automatic artist biographies, album art, and genre information fetched from multiple online sources (Deezer → TheAudioDB → Last.fm waterfall).
- **High‑DPI Cover Art Caching** — Rust‑powered thumbnail generation (300×300) keeps library scrolling buttery smooth.

### 🖥️ Desktop Integration
- **Native Media Controls** — Full MPRIS (Linux) and SMTC (Windows) support. Your music appears in system notifications, lock screens, and the KDE Connect / GNOME overlay.
- **Global Hotkeys** — Control playback (Play/Pause, Next, Previous) from anywhere in the OS — even when the window is hidden.
- **System Tray** — Minimise to tray with quick access to playback controls and now‑playing info.

### 🎨 Design & Theming
- **Adaptive Light / Dark Mode** — Choose Light (`#FAFAFA`), Dark (`#242424`), or follow your OS preference automatically.
- **Custom Accent Colour** — Adwaita Blue (`#3584E4`) by default, fully configurable in Settings.
- **Inter / SF Pro Typography** — A clean, modern typeface for a high‑end desktop feel.

---

## ✦ Technology Stack

| Layer          | Technology                                                       |
|:---------------|:-----------------------------------------------------------------|
| **Framework**  | [Tauri v2](https://tauri.app/) — Rust backend, webview frontend  |
| **Frontend**   | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) |
| **UI Toolkit** | [MUI v6](https://mui.com/) — customised with Libadwaita tokens  |
| **Audio**      | [Rodio](https://github.com/RustAudio/rodio) — pure Rust playback |
| **Metadata**   | [Lofty](https://github.com/Serial-ATA/lofty-rs) — read/write audio tags |
| **Desktop**    | [souvlaki](https://github.com/Sinono3/souvlaki) — MPRIS & SMTC  |
| **Shortcuts**  | `tauri-plugin-global-shortcut`                                   |
| **Images**     | `image` crate — thumbnail generation                            |
| **Database**   | SQLite (via `rusqlite`)                                         |

---

## ✦ Getting Started

### Prerequisites

| OS       | Requirements                                                                 |
|:---------|:-----------------------------------------------------------------------------|
| **Any**  | Node.js **v20+** · Rust toolchain (**1.77+**) · Git                        |
| **Windows** | [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/downloads/) (MSVC) |
| **Linux**   | `libadwaita-1-dev` · `webkit2gtk-4.1-dev` · `libayatana-appindicator3-dev` |

### Development

```bash
# Clone the repository
git clone https://github.com/Michael-Mathu/athu-music-d.git
cd athu-music-d

# Install frontend dependencies
npm install

# Launch in development mode (hot‑reload enabled)
npm run tauri dev
```

### Production Build

```bash
# Build distributable binaries
npm run tauri build

# Build specific platform bundles (Windows)
npm run tauri build -- --bundles msi,nsis
```

Outputs will appear in `src-tauri/target/release/bundle/`.

---

## ✦ Project Architecture

```text
athu-music-d/
├── src/                          # React frontend
│   ├── App.tsx                   # Shell layout, view routing
│   ├── main.tsx                  # Entry point
│   ├── assets/                   # Logo, fonts, static images
│   ├── components/
│   │   ├── layout/               # HeaderBar, NavRail, Sidebar
│   │   ├── ErrorBoundary.tsx     # Global error handler
│   │   └── LibrarySort.tsx       # Sort‑control dropdown
│   ├── hooks/                    # Custom hooks (useSort, etc.)
│   ├── lib/
│   │   ├── ThemeContext.tsx       # Theme mode & accent state
│   │   └── utils/sorting.ts      # Sorting utilities
│   ├── theme/
│   │   └── index.ts              # MUI theme (dark + light tokens)
│   ├── types/                    # TypeScript type definitions
│   └── views/
│       ├── NowPlaying.tsx        # Playback + interactive lyrics
│       ├── LyricsEditor.tsx       # LRC creation / editing
│       ├── Tracks.tsx
│       ├── Albums.tsx
│       ├── Artists.tsx
│       ├── Playlists.tsx
│       └── Settings.tsx
│
└── src-tauri/                    # Rust backend
    ├── Cargo.toml                # Rust dependencies
    ├── tauri.conf.json           # Tauri configuration
    ├── capabilities/             # Permission manifests
    ├── icons/                    # App icons
    └── src/
        ├── main.rs               # Tauri entry point & command registration
        ├── lib.rs                # Core application logic
        ├── player.rs             # Rodio audio engine
        ├── database.rs           # SQLite library store
        ├── metadata.rs           # Tag parsing & online metadata
        ├── lyrics.rs             # LRC download & embedding
        ├── mpris_smtc.rs         # Desktop media integration
        └── thumbnail_cache.rs    # High‑DPI cover art generation
```

---

## ✦ Design System

Athu Music D follows the Libadwaita / GTK4 human interface guidelines as closely as possible within a React + MUI context.

| Token     | Value                                                          |
|:----------|:---------------------------------------------------------------|
| **Accent**  | #3584E4 (Adwaita Blue) — configurable                          |
| **Dark BG** | #242424 (left panel) / #2A2A2A (right panel)                  |
| **Light BG**| #FAFAFA (left panel) / #FFFFFF (right panel)                  |
| **Radii**   | 12 px (window), 8 px (buttons), 4 px (rows)                   |
| **Borders** | 0.5 px rgba(255,255,255,0.08) dark / rgba(0,0,0,0.08) light    |
| **Typography**| Inter / SF Pro — 400 & 600 weights                           |

For detailed version history, see [CHANGELOG.md](CHANGELOG.md).

---

## ✦ Roadmap

What's next for Athu Music D?

- [ ] **Equaliser** — 10‑band parametric EQ with presets
- [ ] **Gapless / Crossfade Playback** — Seamless transitions
- [ ] **ReplayGain** — Automatic volume normalisation
- [ ] **Smart Playlists** — “Recently Added”, “Favourites”, “Most Played”
- [ ] **Batch Tag Editor** — Multi‑track metadata editing
- [ ] **Audio Visualiser** — Waveform / frequency‑domain visualisation
- [ ] **i18n** — Multi‑language UI support
- [ ] **macOS Support** — Expand platform coverage
- [ ] **Plugin System** — Extensible architecture for community add‑ons

Have an idea? Open a feature request!

---

## ✦ Contributing

Contributions are warmly welcomed! Whether it's a bug report, feature suggestion, or pull request:

1.  **Fork** the repository
2.  **Create a branch** (`git checkout -b feat/my-feature`)
3.  **Commit your changes** (`git commit -m 'Add some feature'`)
4.  **Push to the branch** (`git push origin feat/my-feature`)
5.  **Open a Pull Request**

Please check existing issues before starting work, and ensure your code follows the project's TypeScript and Rust formatting conventions.

---

## ✦ License

Athu Music D is released under the **MIT License**. See [LICENSE](LICENSE) for full terms.

---

## ✦ Acknowledgements

- **Tauri** — The next‑gen app framework
- **Libadwaita / GTK** — Design language inspiration
- **LRCLIB** — Community synced lyrics database
- **TheAudioDB** — Artist metadata API
- **Last.fm** — Artist biographies & images
- **Deezer** — Artist & album art

<p align="center">
  <sub>Made with ❤️ by <a href="https://github.com/Michael-Mathu">Michael Mathu</a> · <a href="https://github.com/Michael-Mathu/athu-music-d/releases">Download Latest</a></sub>
</p>
