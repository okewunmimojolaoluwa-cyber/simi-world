// GLOBAL MUSIC PLAYER
// Persists across navigation, stops on page unload
// Tracks are loaded dynamically from database

let globalAudio: HTMLAudioElement | null = null;
let currentTrackIndex: number = 0;
let isPlaying: boolean = false;

// Music tracks interface
export interface Track {
  id: number;
  title: string;
  artist: string;
  file: string;
  color: string;
}

// Default hardcoded tracks (fallback if database empty)
const DEFAULT_TRACKS: Track[] = [
  { id: 1,  title: "Who's Dat Girl",     artist: 'Ayra Starr ft. Rema',   file: '/audio/Ayra_Starr_Ft_Rema_Whos_Dat_Girl_2621_AllNaijaMusic.mp3',      color: '#e8405a' },
  { id: 2,  title: 'Cutesy',             artist: 'BNXN',                   file: '/audio/BNXN_Cutesy_7677_AllNaijaMusic.mp3',                            color: '#a060e8' },
  { id: 3,  title: 'Eja Meja',           artist: 'BNXN ft. Asake',         file: '/audio/BNXN_Ft_Asake_Eja_Meja_7316_AllNaijaMusic.mp3',                 color: '#40c8a0' },
  { id: 4,  title: 'Online',             artist: 'BNXN',                   file: '/audio/BNXN_Online_7945_AllNaijaMusic.mp3',                            color: '#e88040' },
  { id: 5,  title: 'B4 B4',             artist: 'Davido ft. Mayorkun',    file: '/audio/Davido_ft_Mayorkun__Fola_B4_B4_8118_AllNaijaMusic.mp3',         color: '#40a0e8' },
  { id: 6,  title: "It's Over",          artist: 'FOLA ft. Bella Shmurda', file: '/audio/FOLA_ft_Bella_Shmurda__Zlatan_its_over_7021_AllNaijaMusic.mp3', color: '#e840c8' },
  { id: 7,  title: 'Soundgasm',          artist: 'Rema',                   file: '/audio/Rema_-_Soundgasm@allnaijamusic.com.mp3',                        color: '#c8e840' },
  { id: 8,  title: 'Baby Is It a Crime', artist: 'Rema',                   file: '/audio/Rema_Baby_Is_it_a_Crime_5821_AllNaijaMusic.mp3',                 color: '#e84060' },
  { id: 9,  title: 'Back 2 U',           artist: 'Seyi Vibez',             file: '/audio/Seyi_Vibez_BACK_2_U_4041_AllNaijaMusic.mp3',                    color: '#60e8a0' },
  { id: 10, title: 'GTA',               artist: 'Seyi Vibez',             file: '/audio/Seyi_Vibez_GTA_2452_AllNaijaMusic.mp3',                         color: '#e8c040' },
  { id: 11, title: "Where I'm From",    artist: 'TML Vibez ft. Seyi Vibez', file: '/audio/TML_Vibez_ft_Seyi_Vibez_Where_Im_From_6025_AllNaijaMusic.mp3', color: '#8040e8' },
];

// Dynamic tracks (loaded from database)
let dynamicTracks: Track[] = [];
let tracksLoaded = false;

// Export TRACKS - will be updated when loaded from database
export let TRACKS: Track[] = DEFAULT_TRACKS;

/**
 * Force reload tracks from database
 * Call this to refresh the music library
 */
export async function reloadTracks(): Promise<void> {
  tracksLoaded = false;
  await loadTracksFromDatabase();
  notifyListeners();
}

/**
 * Fetch tracks from database
 */
async function loadTracksFromDatabase(): Promise<void> {
  if (tracksLoaded) return;
  
  try {
    const response = await fetch('/api/media?type=music');
    if (!response.ok) {
      console.warn('[globalMusic] Database fetch failed, using defaults');
      return;
    }

    const data = await response.json();
    const dbTracks = data.media || [];

    if (dbTracks.length === 0) {
      console.log('[globalMusic] No music in database, using defaults');
      return;
    }

    // Convert database format to Track format
    const colors = ['#e8405a', '#a060e8', '#40c8a0', '#e88040', '#40a0e8', '#e840c8', '#c8e840', '#e84060', '#60e8a0', '#e8c040', '#8040e8', '#4060e8'];
    dynamicTracks = dbTracks.map((item: any, index: number) => ({
      id: index + 1,
      title: item.title,
      artist: item.artist || 'Unknown Artist',
      file: item.publicUrl,
      color: colors[index % colors.length],
    }));

    TRACKS = dynamicTracks;
    tracksLoaded = true;
    console.log('[globalMusic] Loaded', TRACKS.length, 'tracks from database');
  } catch (error) {
    console.error('[globalMusic] Error loading tracks:', error);
  }
}

// Load tracks on initialization (client-side only)
if (typeof window !== 'undefined') {
  loadTracksFromDatabase();
}

type MusicListener = () => void;
const listeners: Set<MusicListener> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function subscribeToMusic(listener: MusicListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudio && typeof window !== 'undefined') {
    globalAudio = new Audio();
    globalAudio.volume = 0.8;
    globalAudio.preload = 'metadata';
    
    // Add error handling for playback issues
    globalAudio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      const error = globalAudio?.error;
      if (error) {
        console.error('Error code:', error.code, 'Message:', error.message);
      }
    });
    
    // Stop music when page unloads
    window.addEventListener('beforeunload', () => {
      if (globalAudio) {
        globalAudio.pause();
        globalAudio.src = '';
      }
    });
  }
  return globalAudio!;
}

export function getCurrentTrackIndex(): number {
  return currentTrackIndex;
}

export function setCurrentTrackIndex(index: number) {
  currentTrackIndex = index;
  notifyListeners();
}

export function getIsPlaying(): boolean {
  return isPlaying;
}

export function setIsPlaying(playing: boolean) {
  isPlaying = playing;
  notifyListeners();
}

export function getCurrentTrack() {
  return TRACKS[currentTrackIndex] || TRACKS[0];
}
