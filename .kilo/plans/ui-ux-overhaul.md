# UI/UX Visual & Experiential Overhaul Plan
## Apple Music / Songbird-Inspired Design System for athu-music-d

---

## 1. Design Philosophy & Aesthetic Direction

**Core Inspiration:** Apple Music (macOS/iOS), Songbird, Sonos, modern glassmorphism
**Keywords:** Clean, breathable, translucent, fluid, layered, contextual, premium

**Principles:**
- Content-first: UI recedes, music advances
- Depth through layering (glass panels, subtle shadows, blur)
- Micro-interactions that feel physical (spring physics, haptic-feeling feedback)
- Dark mode as the primary experience with an elevated light mode
- Accessibility-first contrast ratios (WCAG 2.1 AA minimum)
- Reduced motion support via `prefers-reduced-motion`

---

## 2. Color System

### 2.1 Dark Mode (Primary Palette)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#0D0D0F` | App background (deepest layer) |
| `--bg-elevated` | `#1A1A1D` | Sidebar, panels |
| `--bg-surface` | `#232327` | Cards, rows, elevated surfaces |
| `--bg-glass` | `rgba(28, 28, 32, 0.72)` | Glass overlays, modals |
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` | Dividers |
| `--border-medium` | `rgba(255, 255, 255, 0.10)` | Interactive borders |
| `--text-primary` | `#F5F5F7` | Primary text |
| `--text-secondary` | `#86868B` | Secondary text |
| `--text-tertiary` | `#5A5A60` | Tertiary / disabled |
| `--accent-default` | `#FA2D48` | Apple Music red (user-customizable) |
| `--accent-glow` | `rgba(250, 45, 72, 0.25)` | Glow effects behind active elements |
| `--accent-subtle` | `rgba(250, 45, 72, 0.12)` | Subtle accent backgrounds |

### 2.2 Light Mode Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#FBFBFD` | App background |
| `--bg-elevated` | `#FFFFFF` | Sidebar, panels |
| `--bg-surface` | `#F5F5F7` | Cards, rows |
| `--bg-glass` | `rgba(255, 255, 255, 0.78)` | Glass overlays |
| `--border-subtle` | `rgba(0, 0, 0, 0.04)` | Dividers |
| `--border-medium` | `rgba(0, 0, 0, 0.08)` | Interactive borders |
| `--text-primary` | `#1D1D1F` | Primary text |
| `--text-secondary` | `#6E6E73` | Secondary text |
| `--text-tertiary` | `#AEAEB2` | Tertiary / disabled |
| `--accent-default` | `#FA2D48` | Accent |
| `--accent-glow` | `rgba(250, 45, 72, 0.18)` | Glow effects |
| `--accent-subtle` | `rgba(250, 45, 72, 0.08)` | Subtle accent backgrounds |

### 2.3 Semantic Accent Colors (User-selectable presets)

Beyond the default Apple Music red, offer 6–8 curated accent options:
- **Songbird Red** (`#FA2D48`) - default
- **Electric Indigo** (`#5E5CE6`)
- **Sky Blue** (`#007AFF`)
- **Mint Green** (`#30D158`)
- **Tangerine** (`#FF9F0A`)
- **Lavender** (`#BF5AF2`)
- **Teal** (`#64D2FF`)
- **Coral Pink** (`#FF375F`)

**Implementation:** Extend `ThemeContext` with an `accentPreset` enum; generate light/dark variants dynamically using HSL manipulation.

### 2.4 Dynamic / Contextual Backgrounds

- Extract dominant color from now-playing cover art using canvas pixel analysis
- Apply as a very subtle radial gradient at ≈ 8% opacity behind the left panel and NowPlaying view
- Debounce color extraction to avoid jarring transitions (400ms delay + 800ms CSS transition)
- Fallback to user accent color if no cover art available

---

## 3. Typography System

### 3.1 Font Stack

**Primary:** `"SF Pro Display" / "SF Pro Text"` (system font on macOS; fallback to `Inter` on other platforms)
**Monospace (metadata):** `"SF Mono" / "Menlo" / "JetBrains Mono"` for durations, file paths

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-display` | 34–48px | 700 | 1.1 | Hero album/artist detail headers |
| `--text-title-1` | 28px | 700 | 1.2 | Now Playing track title (large) |
| `--text-title-2` | 22px | 600 | 1.25 | Section headers, card titles |
| `--text-title-3` | 17px | 600 | 1.3 | Subsection headers |
| `--text-body` | 15px | 400 | 1.5 | Primary body text |
| `--text-callout` | 13px | 500 | 1.4 | Secondary metadata, captions |
| `--text-footnote` | 11px | 500 | 1.35 | Uppercase labels, timestamps |
| `--text-micro` | 10px | 600 | 1.3 | Badges, chips (letter-spacing 0.02em) |

### 3.3 Typography MUI Overrides Refactor

Centralize all typography in a `src/theme/typography.ts` module exporting `typography` object conforming to MUI `TypographyOptions`. Replace scattered inline `sx={{ fontWeight, fontSize }}` patterns with MUI variants where possible.

---

## 4. Layout System

### 4.1 Spacing Scale (8pt grid)

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

### 4.2 App Shell

**Current:** 320px left panel + flexible right panel + top HeaderBar + top NavRail

**Proposed refined layout:**
```
┌─────────────────────────────────────────────────────────┐
│ HeaderBar (48px) — window controls, global actions       │
├──────────┬──────────────────────────────────────────────┤
│          │ NavRail (40px) — context tabs                │
│  Now     │──────────────────────────────────────────────│
│ Playing  │                                              │
│ Panel    │  Scrollable Content Area                     │
│ (320px)  │  (grid/list views, detail sheets)           │
│          │                                              │
│ 🎵 Player│                                              │
│ ≡ Lyrics │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

**Changes:**
- Remove left panel border/separator; use a subtle 1px gradient divider instead
- Add `padding: 0` to outer shell; use internal spacing
- Implement `resizable` left panel logic (240px–420px range via Tauri window manager or drag handle)
- Glassmorphism: apply `backdrop-filter: blur(40px)` + semi-transparent bg to both panels

### 4.3 Grid Architecture for View Contents

- **Tracks view:** Full-width rows with consistent 52px height, sticky column headers
- **Albums view:** Responsive grid `repeat(auto-fill, minmax(160px, 1fr))` with 20px gaps; increase to `minmax(180px, 1fr)` on wider screens
- **Artists view:** Horizontal scrolling chip strip at top for genre/filters; list below; detail becomes full sheet overlay
- **Queue view:** Draggable list (integrate `@dnd-kit/core` or Tauri-native drag) with reorder handles

---

## 5. Component-Specific Redesign Specs

### 5.1 NowPlaying (Left Panel)

**Before:** Flat dark gray background, basic accent-colored play button, emoji in tabs.

**After:**
- Background: `--bg-elevated` with `backdrop-filter: blur(60px)` and a radial gradient derived from cover art at 6–10% opacity in top-left
- Cover art: 200px × 200px with `20px` radius, soft shadow `0 8px 40px rgba(0,0,0,0.25)`; hover lifts with `transform: translateY(-4px)` + stronger shadow
- Progress bar: Slimmer (3px rail), rounded pill thumb (14px) with white fill and accent glow on drag; show time labels with SF Mono
- Transport controls: Larger hit targets (48px), white filled play button with accent glow `box-shadow: 0 0 0 8px var(--accent-glow)`; secondary controls (shuffle, repeat, volume) as ghost buttons with icon-only states
- Tab toggle: Pill-shaped segmented control with blur glass background; active state uses accent color with 20% opacity fill; remove emoji, use SF Symbols-style icons (music.note, text.alignleft)
- Lyrics view: Mini player bar sticky at top (48px height) with live progress; active lyric line scales to 1.1×, color `accent-default`, others at 30% opacity; hover reveals subtle background highlight

### 5.2 HeaderBar

**Before:** Transparent background, basic icon buttons, no visual hierarchy.

**After:**
- Height remains 48px but adds a frosted glass base (`--bg-glass` + `backdrop-filter: blur(20px)`)
- Logo: Use vector SVG (replace raster `/src/assets/logo.png`) with `currentColor` fill adapting to theme
- Action buttons (lyrics editor, search): Pill-shaped with 6px radius; hover fills with `--border-medium`; active state uses accent with 15% opacity
- Window controls: Circle-shaped traffic lights (macOS style) OR flat modern rect icons with hover-only red/yellow/green states; add `data-tauri-drag-region` padding
- Add a thin 0.5px gradient border bottom: `linear-gradient(to right, transparent, var(--border-medium), transparent)`

### 5.3 NavRail

**Before:** Flat gray background (`#2A2A2A`), icon-only buttons, tooltips.

**After:**
- Height: 44px (slightly more breathable)
- Background: `--bg-surface` with bottom border only
- Active tab: Pill indicator behind icon (8px height pill), accent color at 15% fill; icon color transitions to accent
- Hover: Soft background `--border-subtle` with 120ms ease-out
- Add text labels alongside icons (12px, 600 weight, `--text-secondary`) on hover — fades in after 150ms delay; hides on active tab to save space
- Transition all state changes with `cubic-bezier(0.25, 0.1, 0.25, 1)` (iOS standard)

### 5.4 Track Row (Virtualized List)

**Before:** Basic row with cover art, emoji-free, 52px height.

**After:**
- Height: 56px (slightly taller for touch comfort)
- Row states:
  - **Default:** Subtle bottom border instead of full row hover
  - **Hover:** Background `--border-subtle` + 4px left accent bar (2px wide) in accent color
  - **Active/Playing:** Background `--accent-subtle` + left accent bar + title color `accent-default`; pulse animation on the accent bar (optional)
- Index number: Hidden by default, show on hover (opacity 1 → 0); replaced by animated play icon on active row
- More button (`⋮`): Always visible on active row; on hover for others; animated slide-in from right
- Add drag handle for queue reordering (three-dot grip icon, wider touch target)

### 5.5 Album & Artist Cards

**Album Card:**
- Remove scale-on-hover (Apple removed this trend); use subtle lift instead: `transform: translateY(-2px)` with `box-shadow: 0 8px 24px rgba(0,0,0,0.12)`
- Title: 14px semibold, two-line clamp with `-webkit-line-clamp: 2`
- Add a translucent play button overlay (bottom-right corner of art) that fades in on hover: 36px circle, accent fill, white play icon; full opacity on active/hover
- Corner radius: `12px` (aligned with global radius scale)

**Artist Card (List Row):**
- Avatar: 48px with ring effect when hovered (`box-shadow: 0 0 0 2px var(--border-medium)`)
- Add a "Follow" or pin button (micro-action) on hover; ephemeral UI that fades after 2s

**Detail Views (Album/Artist):**
- Convert drill-down into slide-over sheets instead of full page swaps (if practical for Tauri window)
- Hero section: Large blurred cover art gradient background (20% opacity, 80px blur); content overlaid with gradient fade-to-solid
- Track list: Same as main TrackRow but with numbered column

### 5.6 Search Overlay

**Before:** Fade overlay with dark backdrop.

**After:**
- Backdrop: `rgba(0,0,0,0.5)` + `backdrop-filter: blur(30px)` with smooth 200ms fade
- Search card: `--bg-glass` with border `--border-subtle` and stronger shadow; rounded corners 16px
- Input field: Remove border, use bottom-only 1px accent line on focus; placeholder `--text-tertiary`
- Results: Animate in with staggered fade + slide (40ms delay per item, 200ms duration, ease-out)
- Section headers: Pill-shaped labels with `--accent-subtle` background and 6px radius
- Keyboard navigation: Arrow keys, Enter to select, Escape to close

### 5.7 Scan Card (Tracks View)

**Before:** Simple input + button.

**After:**
- Card: `--bg-surface` with rounded corners 12px; left accent bar (3px) in accent color
- Input: Ghost style with bottom border only (1px `--border-medium`) that expands to accent on focus
- Scan button: Rounded pill (full height of input), accent gradient background, hover lift + shadow
- Add animated progress indicator when scanning (use Tauri event stream for real-time progress)
- Add a subtle shimmer skeleton state while scanning

---

## 6. Animation & Motion System

### 6.1 Timing Functions

| Motion | Duration | Easing |
|--------|----------|--------|
| Button press | 100ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Hover state | 150ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Panel slide | 300ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Overlay enter | 250ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Spring scale | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Staggered list | 30ms/item | `cubic-bezier(0.25, 0.1, 0.25, 1)` |

### 6.2 Key Animations to Implement

1. **NowPlaying reveal:** When a track starts, cover art scales from 0.94 → 1 with spring easing; title fades in up 8px
2. **Cover art crossfade:** On track change, old art fades out while new art fades in (200ms overlap)
3. **Progress bar scrub feedback:** Thumb expands from 12px → 18px on drag; tooltip shows time
4. **Tab switch (Player ↔ Lyrics):** Crossfade + slight vertical translation (4px up for incoming)
5. **Search overlay:** Backdrop blur ramps from 0 → 30px over 250ms; results stagger in from top (translateY(-8px) → 0, opacity 0 → 1)
6. **Play/pause toggle:** Icon morphs (use CSS transition on `transform: scale(0.8) → scale(1)` with 150ms spring)
7. **NavRail active indicator:** Pill slides horizontally (translateX) with 200ms ease-out
8. **Hover micro-feedback:** All interactive elements get a 1px border-radius-aware ring or glow on hover

### 6.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. New UI Elements to Implement

### 7.1 Glass Panel System

Create `src/components/GlassPanel.tsx`:
```tsx
<Box sx={{
  bgcolor: 'var(--bg-glass)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border: '0.5px solid var(--border-subtle)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}}>
  {children}
</Box>
```
Reuse across: SearchOverlay, Settings pages, Lyrics sheet, Context menus.

### 7.2 Accent Glow Utility

Create `src/components/AccentGlow.tsx` for decorative radial gradient behind active elements:
```tsx
<Box sx={{
  position: 'absolute',
  width: 200,
  height: 200,
  background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
  filter: 'blur(40px)',
  pointerEvents: 'none',
  zIndex: 0,
}} />
```

### 7.3 Smart Context Menu

Replace basic MUI Menu with custom glass-styled `ContextMenu.tsx`:
- Appears at cursor position
- Glass background + blur
- Icon + label layout, 36px row height
- Hover state: accent fill at 10%
- Destructive actions (delete, remove) in red with 10% red background
- Slots for: divider, submenu arrow, keyboard shortcut

### 7.4 Toast / Snackbar System

Replace `console.error` and silent failures with non-blocking toasts:
- Bottom-center of right panel (above scroll area)
- Glass background, 8px radius
- Auto-dismiss after 4s with linear shrink animation
- Pill-shaped, includes icon (success ✓, error ✕, info ℹ)
- Supports action button ("Retry", "Open Folder")
- Stackable (max 3 visible)

### 7.5 Skeleton Loading States

Create `src/components/SkeletonCard.tsx` and `SkeletonRow.tsx`:
- Shimmer animation using linear-gradient background that translates infinitely
- Match exact dimensions of replaced content
- Use in: Albums/Artists grids while images load; Track rows during initial library fetch

### 7.6 Empty State Illustrations

For tracks, albums, artists, playlists when lists are empty:
- Centered content with scale-aware SVG illustration (music note, vinyl, etc.) in `--text-tertiary`
- Helpful headline (e.g., "No tracks yet") + subtext + primary CTA button
- Fade in with subtle Y-axis translation

### 7.7 Mini Player Bar (Optional Sticky Footer)

Consider adding a persistent 64px tall mini player **below** the scrollable content in the right panel (not overlapping; reflows content padding):
- Cover art (40px) + title/artist + play/pause + progress scrubber
- Glass background + top border
- Always visible when a track is loaded, collapses when nothing is playing

---

## 8. Accessibility Improvements

1. **Focus management:** Implement focus trap in SearchOverlay; return focus to trigger element on close
2. **Skip links:** Hidden skip-to-content link visible on focus
3. **ARIA live regions:** Announce track changes, search result counts, loading states to screen readers
4. **Color contrast:** All text/background combos must meet WCAG 2.1 AA (≥ 4.5:1 for normal text, ≥ 3:1 for large)
5. **Touch targets:** Minimum 44×44px for all interactive elements (macOS/iOS HIG)
6. **Keyboard shortcuts:** 
   - `Space` / `K`: Play/Pause
   - `←/→`: Previous/Next
   - `Ctrl/Cmd + F`: Search
   - `Ctrl/Cmd + ,`: Settings
   - `Esc`: Close overlays
7. **Reduced motion:** Respect `prefers-reduced-motion` (see §6.3)

---

## 9. Implementation Plan (Phased)

### Phase 1: Foundation (Theme + Tokens) — 2–3 days
- [ ] Create `src/theme/tokens.ts` exporting all color, spacing, radius, and motion tokens as CSS custom properties + JS constants
- [ ] Refactor `src/theme/index.ts` + `src/theme/typography.ts` to use token system
- [ ] Update `ThemeContext` to support accent presets + dynamic background extraction
- [ ] Add `prefers-reduced-motion` detection and CSS override
- [ ] Replace `App.css` font-face with proper SF Pro fallback chain; remove Inter alias hack
- [ ] Add global smooth scrolling + scrollbar theming tokens

### Phase 2: Glass System + Base Components — 2–3 days
- [ ] Implement `GlassPanel.tsx`, `AccentGlow.tsx`, `ContextMenu.tsx`, `Toast.tsx`
- [ ] Redesign `CoverArtImage.tsx` with shimmer skeleton + crossfade
- [ ] Update `App.tsx` layout to use new spacing tokens and glass panels
- [ ] Redesign `HeaderBar.tsx` with frost glass + SVG logo
- [ ] Redesign `NavRail.tsx` with pill indicator + hover labels + slide animation

### Phase 3: View Redesigns — 3–4 days
- [ ] Redesign `NowPlaying.tsx` (cover art lift, spring play button, lyrics stagger fade)
- [ ] Redesign `Tracks.tsx` (scan card, track row states, shimmer loading)
- [ ] Redesign `Albums.tsx` (play overlay, hero detail, grid refinement)
- [ ] Redesign `Artists.tsx` (avatar ring, bio card, discography horizontal scroll)
- [ ] Redesign `SearchOverlay.tsx` (glass card, stagger results, keyboard nav)
- [ ] Redesign `Playlists.tsx` and `Queue.tsx` if present

### Phase 4: Polish + Accessibility — 1–2 days
- [ ] Implement empty state illustrations
- [ ] Add skeleton loaders throughout
- [ ] Keyboard shortcut system (global Tauri shortcut listener)
- [ ] Focus management and ARIA audits
- [ ] Reduced motion testing
- [ ] Hover state animation refinement (stagger timing)

### Phase 5: Dynamic Backgrounds + Micro-interactions — 1–2 days
- [ ] Canvas-based dominant color extraction from cover art
- [ ] Apply contextual gradients to NowPlaying and detail views
- [ ] Add spring physics to play/pause, tab switches, and panel transitions
- [ ] Polish: hover ring effects, active state pulses, micro-glow feedback

---

## 10. File Change Map (High-Level)

| File | Action | Summary |
|------|--------|---------|
| `src/theme/tokens.ts` | **CREATE** | CSS custom properties + JS token map |
| `src/theme/typography.ts` | **CREATE** | Centralized MUI typography config |
| `src/theme/index.ts` | **MODIFY** | Integrate tokens, update palette, add accent presets |
| `src/theme/shadadows.ts` | **CREATE** | Unified shadow elevation scale |
| `src/ThemeContext.tsx` | **MODIFY** | Add `accentPreset`, add cover-art color extractor hook |
| `src/App.css` | **MODIFY** | Define `:root` custom properties, font-family, reduced motion |
| `src/App.tsx` | **MODIFY** | Apply glass panels, new layout spacing, dynamic bg |
| `src/components/GlassPanel.tsx` | **CREATE** | Reusable glass-morphism wrapper |
| `src/components/AccentGlow.tsx` | **CREATE** | Decorative glow component |
| `src/components/ContextMenu.tsx` | **CREATE** | Custom glass context menu |
| `src/components/Toast.tsx` | **CREATE** | Toast notification system |
| `src/components/SkeletonCard.tsx` | **CREATE** | Album/artist card skeleton |
| `src/components/SkeletonRow.tsx` | **CREATE** | Track row skeleton |
| `src/components/CoverArtImage.tsx` | **MODIFY** | Add shimmer, crossfade, spring lift |
| `src/components/layout/HeaderBar.tsx` | **MODIFY** | Glass background, SVG logo, refined controls |
| `src/components/layout/NavRail.tsx` | **MODIFY** | Pill indicator, hover labels, slide animation |
| `src/components/SearchOverlay.tsx` | **MODIFY** | Glass card, stagger results, keyboard nav |
| `src/components/LibrarySort.tsx` | **MODIFY** | Match new token scale |
| `src/views/NowPlaying.tsx` | **MODIFY** | Full redesign per §5.1 |
| `src/views/Tracks.tsx` | **MODIFY** | Full redesign per §5.4 |
| `src/views/Albums.tsx` | **MODIFY** | Full redesign per §5.5 |
| `src/views/Artists.tsx` | **MODIFY** | Full redesign per §5.5 |
| `src/views/Queue.tsx` | **MODIFY** | Drag reorder + glass cards |
| `src/views/Playlists.tsx` | **MODIFY** | Grid/list polish |
| `src/views/Settings.tsx` | **MODIFY** | Glass cards for settings groups |
| `src/views/LyricsEditor.tsx` | **MODIFY** | Match new typography/glass |
| `src/hooks/useTheme.ts` | **CREATE** | Hook for dynamic background color extraction |
| `src/lib/utils/animations.ts` | **CREATE** | Shared spring/timing presets |
| `src/index.html` | **MODIFY** | Ensure Inter/SF Pro font link or preload |

---

## 11. Risks & Considerations

1. **Tauri window transparency:** `backdrop-filter` requires the Tauri window to have transparent/vibrancy enabled; verify in `tauri.conf.json` capabilities
2. **Performance:** Excessive `backdrop-filter` on many elements can cause GPU strain; lint for overuse
3. **MUI override proliferation:** Consolidate custom styles into tokens to avoid 500+ inline `sx` prop overrides
4. **Font availability:** SF Pro is macOS-only; Inter fallback must be seamless; test on Windows/Linux
5. **Reactivity lag:** Canvas color extraction on every track change may cause jank; use `requestIdleCallback` or Web Worker

---

## 12. Success Metrics

- **Visual:** App matches Apple Music's density and breathing room; glass panels feel native, not tacked-on
- **Performance:** 60fps animations; no measurable frame drops during scroll or hover
- **Accessibility:** Pass axe-core audit with 0 violations (AA standard)
- **Adoption:** User can switch all 8 accent presets instantly; dynamic background reacts within 500ms of track change
- **Maintainability:** New views can be built using only token classes (no magic numbers in sx props)
