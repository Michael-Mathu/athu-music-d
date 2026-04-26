import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import type { Album, AlbumArtPayload, Artist, ArtistBioPayload, LyricsPayload, Playlist, PlaylistTrack, Track } from "../types/library";

export const openDirectory = async (): Promise<string | null> => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: 'Select Music Folder'
  });
  return selected as string | null;
};

export const listTracks = () => invoke<Track[]>("list_tracks");
export const listAlbums = () => invoke<Album[]>("list_albums");
export const listArtists = () => invoke<Artist[]>("list_artists");
export const listPlaylists = () => invoke<Playlist[]>("list_playlists");
export const listPlaylistTracks = (playlistId: number) => invoke<PlaylistTrack[]>("list_playlist_tracks", { playlistId });
export const createPlaylist = (name: string) => invoke<Playlist>("create_playlist", { name });
export const addTrackToPlaylist = (playlistId: number, trackId: number) => invoke<void>("add_track_to_playlist", { playlistId, trackId });
export const removeTrackFromPlaylist = (playlistId: number, trackId: number) => invoke<void>("remove_track_from_playlist", { playlistId, trackId });
export const scanLocalFiles = (dir: string) => invoke<string>("scan_local_files", { dir });
export const playAudio = (path: string) => invoke<void>("play_audio", { path });
export const pauseAudio = () => invoke<void>("pause_audio");
export const resumeAudio = () => invoke<void>("resume_audio");
export const setVolume = (volume: number) => invoke<void>("set_volume", { volume });
export const getPlaybackPosMs = () => invoke<number>("get_playback_pos_ms");
export const seekPlaybackMs = (posMs: number) => invoke<void>("seek_playback_ms", { posMs });
export const fetchTrackLyrics = (trackId: number) => invoke<LyricsPayload>("fetch_track_lyrics", { trackId });
export const fetchArtistBio = (artistId: number) => invoke<ArtistBioPayload>("fetch_artist_bio", { artistId });
export const fetchAlbumArt = (albumId: number) => invoke<AlbumArtPayload>("fetch_album_art", { albumId });
export const updateOsMetadata = (title: string, artist: string, album: string, durationMs: number, isPlaying: boolean) => invoke<void>("update_os_metadata", { title, artist, album, durationMs, isPlaying });

export const downloadAndEmbedLyrics = (
    trackId: number,
    artist: String,
    title: String,
    album?: string,
    duration?: number,
    filePath: string
) => invoke<any>("download_and_embed_lyrics", { trackId, artist, title, album, duration, filePath });

/**
 * High-DPI Cover Art Caching
 * @param trackId Unique track identifier
 * @param coverPath Absolute path to the original cover image
 * @returns Promise resolving to the local file path of the 300x300 thumbnail
 */
export const getCoverThumbnail = (trackId: string, coverPath: string) => 
    invoke<string>("get_cover_thumbnail", { trackId, coverPath });
