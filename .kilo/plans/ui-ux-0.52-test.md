# UI/UX Overhaul — 0.52 Test

## Scope
Design system foundation and partial implementation for the Apple Music / Songbird-inspired visual refresh.

## Status
This is the **0.52 test** checkpoint. Implementation is in progress and not fully complete.

## Completed
- Design tokens (`spacing`, `radius`, `lightColors`, `darkColors`) in `src/theme/tokens.ts`
- Theme wiring in `src/theme/index.ts` (MUI theme, component overrides)
- Extended `ThemeContext` with accent presets and `--adw-accent` CSS custom property
- New hooks/components:
  - `src/hooks/useDominantColor.ts`
  - `src/components/GlassPanel.tsx`
  - `src/components/AccentGlow.tsx`
  - `src/components/ContextMenu.tsx`
  - `src/components/Toast.tsx`
  - `src/components/SkeletonRow.tsx`
  - `src/components/SkeletonCard.tsx`
- Layout shell updates:
  - `src/components/layout/HeaderBar.tsx`
  - `src/components/layout/NavRail.tsx`
- View updates:
  - `src/views/NowPlaying.tsx`

## Pending
- Interactive element polish across remaining views:
  - `Tracks.tsx`, `Albums.tsx`, `Artists.tsx`
  - `SearchOverlay.tsx`
  - `Playlists.tsx`, `Queue.tsx`, `Settings.tsx`, `LibrarySort.tsx`
- Full verification pass for dynamic color + glassmorphism across all screens
