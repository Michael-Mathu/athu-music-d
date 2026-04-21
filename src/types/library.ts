export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file_path: string;
  album_id: number | null;
  artist_id: number | null;
  cover_art_data_url: string | null;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  track_count: number;
  year: number | null;
  artist_id: number | null;
  cover_art_data_url: string | null;
}

export interface Artist {
  id: number;
  name: string;
  track_count: number;
  album_count: number;
}

export interface LyricsLine {
  timestamp_ms: number;
  text: string;
}

export interface LyricsPayload {
  track_id: number;
  provider: string;
  raw_lrc: string;
  plain_text: string;
  synced: boolean;
  embedded: boolean;
  stored_path: string | null;
  lines: LyricsLine[];
}

export interface ArtistBioPayload {
  artist_id: number;
  artist_name: string;
  biography: string;
  provider: string;
  source_url: string | null;
}

export interface AlbumArtPayload {
  album_id: number;
  provider: string;
  local_path: string;
  cover_art_data_url: string;
}

export interface Playlist {
  id: number;
  name: string;
  track_count: number;
}

export interface PlaylistTrack {
  playlist_id: number;
  track_id: number;
  position: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
}

export type NavView = 'queue' | 'tracks' | 'albums' | 'artists' | 'playlists' | 'settings';
