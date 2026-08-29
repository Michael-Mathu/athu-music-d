import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleSearch: () => void;
  onToggleLyrics: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onNavigate: (view: string) => void;
  onShowQueue?: () => void;
}

export const useKeyboardShortcuts = ({
  onPlayPause,
  onNext,
  onPrevious,
  onToggleSearch,
  onToggleLyrics,
  onVolumeUp,
  onVolumeDown,
  onNavigate,
  onShowQueue,
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes(
        document.activeElement?.tagName ?? ''
      );

      // Don't capture shortcuts when typing in inputs (except Escape)
      if (isInputFocused && e.key !== 'Escape') return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'f') {
        e.preventDefault();
        onToggleSearch();
      } else if (mod && e.key === 'l') {
        e.preventDefault();
        onToggleLyrics();
      } else if (mod && e.key === '1') {
        e.preventDefault();
        onNavigate('queue');
      } else if (mod && e.key === '2') {
        e.preventDefault();
        onNavigate('tracks');
      } else if (mod && e.key === '3') {
        e.preventDefault();
        onNavigate('albums');
      } else if (mod && e.key === '4') {
        e.preventDefault();
        onNavigate('artists');
      } else if (mod && e.key === '5') {
        e.preventDefault();
        onNavigate('playlists');
      } else if (mod && e.key === '6') {
        e.preventDefault();
        onNavigate('settings');
      } else if (mod && e.key === 'q' && onShowQueue) {
        e.preventDefault();
        onShowQueue();
      } else if (mod && e.key === 'ArrowUp') {
        e.preventDefault();
        onVolumeUp();
      } else if (mod && e.key === 'ArrowDown') {
        e.preventDefault();
        onVolumeDown();
      } else if (!mod && e.key === ' ' && !isInputFocused) {
        e.preventDefault();
        onPlayPause();
      } else if (!mod && e.key === 'n') {
        e.preventDefault();
        onNext();
      } else if (!mod && e.key === 'p') {
        e.preventDefault();
        onPrevious();
      }
    },
    [onPlayPause, onNext, onPrevious, onToggleSearch, onToggleLyrics, onVolumeUp, onVolumeDown, onNavigate, onShowQueue]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
