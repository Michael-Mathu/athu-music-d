import { useCallback, useEffect, useState } from 'react';
import {
  listTracks,
  listAlbums,
  listArtists,
  listPlaylists,
  listPlaylistTracks,
  createPlaylist as apiCreatePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist as apiDeletePlaylist,
  scanLocalFiles,
} from '../lib/tauri';
import type { Album, Artist, Playlist, PlaylistTrack, Track } from '../types/library';

export function useLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<Record<number, PlaylistTrack[]>>({});

  const loadLibrary = useCallback(async () => {
    try {
      const [nextTracks, nextAlbums, nextArtists, nextPlaylists] = await Promise.all([
        listTracks(),
        listAlbums(),
        listArtists(),
        listPlaylists(),
      ]);

      setTracks(nextTracks);
      setAlbums(nextAlbums);
      setArtists(nextArtists);
      setPlaylists(nextPlaylists);

      // Load all playlist tracks in parallel (not sequentially)
      const tracksMapEntries = await Promise.all(
        nextPlaylists.map(async (pl) => {
          const pts = await listPlaylistTracks(pl.id);
          return [pl.id, pts] as [number, PlaylistTrack[]];
        })
      );
      setPlaylistTracks(Object.fromEntries(tracksMapEntries));

      return nextTracks;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  const createPlaylist = useCallback(async (name: string) => {
    await apiCreatePlaylist(name);
    await loadLibrary();
  }, [loadLibrary]);

  const deletePlaylist = useCallback(async (playlistId: number) => {
    await apiDeletePlaylist(playlistId);
    await loadLibrary();
  }, [loadLibrary]);

  const addToPlaylist = useCallback(async (playlistId: number, trackId: number) => {
    await addTrackToPlaylist(playlistId, trackId);
    await loadLibrary();
  }, [loadLibrary]);

  const removeFromPlaylist = useCallback(async (playlistId: number, trackId: number) => {
    await removeTrackFromPlaylist(playlistId, trackId);
    await loadLibrary();
  }, [loadLibrary]);

  const scanFolder = useCallback(async (path: string) => {
    await scanLocalFiles(path);
    await loadLibrary();
  }, [loadLibrary]);

  return {
    tracks,
    albums,
    artists,
    playlists,
    playlistTracks,
    loadLibrary,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    scanFolder,
  };
}

// Helper: Fisher-Yates shuffle
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
