export const IDS = Object.freeze({
  themeToggle: "theme-toggle",
  globalSearchTrigger: "global-search-trigger",
  searchDialog: "search-dialog",
  globalSearchForm: "global-search-form",
  globalSearchInput: "global-search-input",
  recentSearchesList: "recent-searches-list",
  popoverPortal: "popover-portal",
  willHideMenu: "will-hide-menu",
  menuTrigger: "menu-trigger",
  dropdownMenu: "dropdown-menu",
  dropdownClose: "dropdown-close",
  favoriteSongs: "favorite-songs",
  favoriteArtists: "favorite-artists",
  createPlaylist: "create-playlist",
  favoriteSongsCount: "favorite-songs-count",
  favoriteArtistsCount: "favorite-artists-count",
  recentlyPlayed: "recently-played",
  queueView: "queue-view",
  recentCount: "recent-count",
  queueCount: "queue-count",
  recentlyPlayedSection: "recently-played-section",
  randomAlbumsSection: "random-albums-section",
  favoriteArtistsSection: "favorite-artists-section",
  playlistsSection: "playlists-section",
  favoriteSongsSection: "favorite-songs-section",
  searchMusic: "search-music",
  shuffleAll: "shuffle-all",
  appSettings: "app-settings",
  aboutApp: "about-app",
  dynamicContent: "dynamic-content",
  contentLoading: "content-loading",
  albumsContainer: "albumWrapper",
  artistsGrid: "artists-grid",
  artistSearch: "artist-search",
  genreFilters: "genre-filters",
  seekTooltip: "seek-tooltip",
 
 
 
// Drawer IDs
  drawer: "drawer",
  drawerHandle: "drawerHandle",
  
  // Music Player IDs (updated for drawer)
  musicPlayer: "musicPlayer",
  albumCover: "albumCover", 
  songTitle: "songTitle",
  artistName: "artistName",
  albumName: "albumName",
  
  playBtn: "playBtn",
  prevBtn: "prevBtn", 
  nextBtn: "nextBtn",
  rewindBtn: "rewindBtn",
  forwardBtn: "forwardBtn",
  shuffleBtn: "shuffleBtn",
  repeatBtn: "repeatBtn",
  favoriteBtn: "favoriteBtn",
  queueBtn: "queueBtn",
  shareBtn: "shareBtn",
  moreBtn: "moreBtn",
  
  progressBar: "progressBar",
  progressFill: "progressFill", 
  progressThumb: "progressThumb",
  currentTime: "currentTime",
  totalTime: "totalTime",
  
  // Tab content
  queueList: "queueList",
  recentList: "recentList", 
 
 
 
 
/** 
  // Music Player IDs
  musicPlayer: "musicPlayer",
  playBtn: "playBtn",
  prevBtn: "prevBtn",
  nextBtn: "nextBtn",
  shuffleBtn: "shuffleBtn",
  repeatBtn: "repeatBtn",
  favoriteBtn: "favoriteBtn",
  progressBar: "progressBar",
  progressFill: "progressFill",
  progressThumb: "progressThumb",
  currentTime: "current",
  totalTime: "total",
**/  
  // Navbar IDs
  playPauseNavbar: "play-pause-navbar",
  prevBtnNavbar: "prev-btn-navbar",
  nextBtnNavbar: "next-btn-navbar",
  playIconNavbar: "play-icon-navbar",
  pauseIconNavbar: "pause-icon-navbar",
  nowPlayingArea: "now-playing-area",
});

export const CLASSES = Object.freeze({
  hidden: "hidden",
  searchDialogOpening: "search-dialog-opening",
  searchDialogClosing: "search-dialog-closing",
  hasSong: "has-song",
  light: "light",
  medium: "medium",
  show: "show",
  active: "active",
  marquee: "marquee",
  repeatOne: "repeat-one",
  animateRotate: "animate__animated animate__rotateIn",
  animateFadeIn: "animate__animated animate__fadeIn",
  animateZoomIn: "animate__animated animate__zoomIn",
  animatePulse: "animate__animated animate__pulse",
  imageFallback: "image-fallback",
  imageLoaded: "image-loaded",
  imageError: "image-error",
  imageLoading: "image-loading",
  playing: "playing",
});





export const MUSIC_PLAYER = (() => {
  const parent = "#musicPlayer";
  return Object.freeze({
    root: parent,
    handle: `${parent} #mpHandle`,
    close: `${parent} #closeBtn`,
    
    // Content sections
    content: `${parent} .content`,
    activeContent: `${parent} .content.active`,
    
    // Tabs
    tabs: `${parent} .tab`,
    activeTab: `${parent} .tab.active`,
    
    // Player elements
    albumArtwork: `${parent} #cover`,
    songName: `${parent} #title`,
    artistName: `${parent} #artist`,
    albumName: `${parent} #album`,
    
    currentTime: `${parent} #current`,
    totalTime: `${parent} #total`,
    
    progressBar: `${parent} #progressBar`,
    progressFill: `${parent} #progressFill`,
    progressThumb: `${parent} #progressThumb`,
    
    // Control buttons
    play: `${parent} #playBtn`,
    previous: `${parent} #prevBtn`,
    next: `${parent} #nextBtn`,
    reWind: `${parent} #rewindBtn`,
    fastForward: `${parent} #forwardBtn`,
    favoriteBtn: `${parent} #favoriteBtn`,
    queueBtn: `${parent} #queueBtn`,
    shareBtn: `${parent} #shareBtn`,
    moreBtn: `${parent} #moreBtn`,
    
    // Lists
    queueList: `${parent} #queueList`,
    recentList: `${parent} #recentList`,
  });
})();











/**
export const MUSIC_PLAYER = (() => {
  const parent = "#musicPlayer";
  return Object.freeze({
    root: parent,
    close: `${parent} .close`,
    tabs: `${parent} .tab`,
    activeTab: `${parent} .tab.active`,
    content: `${parent} .content`,
    activeContent: `${parent} .content.active`,
    controls: `${parent} .controls .btn`,
    actions: `${parent} .actions .action`,
    playerHandle: `${parent} #handle`,
    playerCloseBtn: `${parent} .close`,
    
    albumArtwork: `${parent} .albumArtwork`,
    songName: `${parent} .songName`,
    artistName: `${parent} .artistName`,
    albumName: `${parent} .albumName`,
    
    currentTime: `${parent} #current`,
    totalTime: `${parent} #total`,
    
    progressBar: `${parent} #progressBar`,
    progressFill: `${parent} #progressFill`,
    progressThumb: `${parent} #progressThumb`,
    
    play: `${parent} #playBtn`,
    previous: `${parent} #prevBtn`,
    next: `${parent} #nextBtn`,
    reWind: `${parent} #rewindBtn`,
    fastForward: `${parent} #forwardBtn`,
    shuffle: `${parent} #shuffleBtn`,
    repeat: `${parent} #repeatBtn`,
    favoriteBtn: `${parent} #favoriteBtn`,
    queueBtn: `${parent} #queueBtn`,
    shareBtn: `${parent} #shareBtn`,
    moreBtn: `${parent} #moreBtn`,
    
    queueList: `${parent} #queueList`,
    recentList: `${parent} #recentList`,
  });
})();
**/



export const NAVBAR = (() => {
  const parent = "#navbar";
  return Object.freeze({
    root: parent,
    nowPlaying: `${parent} #now-playing-area`,
    albumArtwork: `${parent} .albumArtwork`,
    artistName: `${parent} .artistName`,
    songName: `${parent} .songName`,
    
    playIndicator: `${parent} #play-indicator`,
    previous: `${parent} .previous`,
    next: `${parent} .next`,
    playPause: `${parent} .playPause`,
    play: `${parent} #play-icon-navbar`,
    pause: `${parent} #pause-icon-navbar`,
    menuTrigger: `${parent} #menu-trigger`,
    nextNavbar: `${parent} .next`,
  });
})();

export const MODALS = Object.freeze({
  modalClose: ".modal .close",
  dialogClose: "#search-dialog .close",
  dropdownClose: "#dropdown-menu .close",
});

export const ROUTES = Object.freeze({
  HOME: "home",
  ARTIST: "artist",
  ALL_ARTISTS: "allArtists",
  SEARCH: "search",
  ALBUM: "album",
});

export const THEMES = Object.freeze({
  DARK: "dark",
  MEDIUM: "dim",
  LIGHT: "light",
});

export const STORAGE_KEYS = Object.freeze({
  THEME_PREFERENCE: "theme-preference",
  RECENT_SEARCHES: "recentSearches",
  FAVORITE_SONGS: "favoriteSongs",
  FAVORITE_ARTISTS: "favoriteArtists",
  FAVORITE_ALBUMS: "favoriteAlbums",
  RECENTLY_PLAYED: "recentlyPlayed",
  PLAYLISTS: "playlists",
  QUEUE: "queue",
});

export const ICONS = Object.freeze({
  dark: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 116.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>',
  medium: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L13 9h7l-5.5 4 2 7L10 16l-6.5 4 2-7L1 9h7l2-7z"/></svg>',
  light:
    '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
  next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
  prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
  shuffle:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
  repeat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
  heart:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
});

export const AUDIO_FORMATS = Object.freeze(["mp3", "ogg", "m4a"]);

export const REPEAT_MODES = Object.freeze({
  OFF: "off",
  ALL: "all",
  ONE: "one",
});

export const NOTIFICATION_TYPES = Object.freeze({
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
});

export const TOAST_ICONS = {
  [NOTIFICATION_TYPES.INFO]:    '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm.75-11.5a.75.75 0 10-1.5 0v.5a.75.75 0 001.5 0v-.5ZM9 9.75A.75.75 0 019.75 9h.5c.414 0 .75.336.75.75v4.5a.75.75 0 01-1.5 0v-3.75H9.75A.75.75 0 019 9.75Z"/></svg>',
  [NOTIFICATION_TYPES.SUCCESS]: '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4Z"/></svg>',
  [NOTIFICATION_TYPES.WARNING]:'<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.592c.75 1.335-.212 3.009-1.743 3.009H3.482c-1.531 0-2.492-1.674-1.743-3.009L8.257 3.1Zm1.743 3.401a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5Zm0 6.75a.75.75 0 10-1.5 0v.5a.75.75 0 001.5 0v-.5Z"/></svg>',
  [NOTIFICATION_TYPES.ERROR]:   '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm2.828-11.172a1 1 0 00-1.414-1.414L10 6.828 8.586 5.414A1 1 0 107.172 6.828L8.586 8.242 7.172 9.656a1 1 0 101.414 1.414L10 9.656l1.414 1.414a1 1 0 001.414-1.414L11.414 8.242l1.414-1.414Z"/></svg>',
};

export const TOAST_STYLES = {
  [NOTIFICATION_TYPES.INFO]:    { base: "bg-blue-600/95 border-blue-500 text-white",    bar: "bg-white/70" },
  [NOTIFICATION_TYPES.SUCCESS]: { base: "bg-emerald-600/95 border-emerald-500 text-white", bar: "bg-white/70" },
  [NOTIFICATION_TYPES.WARNING]: { base: "bg-amber-600/95 border-amber-500 text-white",  bar: "bg-white/80" },
  [NOTIFICATION_TYPES.ERROR]:   { base: "bg-rose-600/95 border-rose-500 text-white",    bar: "bg-white/70" },
};

export const getElement = (id) => {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID '${id}' not found`);
  }
  return element;
};

export const getElements = (selector) => {
  return document.querySelectorAll(selector);
};

export const getElementInContext = (contextSelector, elementSelector) => {
  const context = document.querySelector(contextSelector);
  return context ? context.querySelector(elementSelector) : null;
};

export const $ = new Proxy(
  {},
  {
    get(_, key) {
      const id = IDS[key];
      return () => (id ? document.getElementById(id) : null);
    },
  }
);

export function $byId(id) {
  return document.getElementById(id);
}

export function $bySelector(selector) {
  return document.querySelector(selector);
}

export function $allBySelector(selector) {
  return document.querySelectorAll(selector);
}

export function $inContext(contextId, elementClass) {
  const context = document.getElementById(contextId);
  return context ? context.querySelector(`.${elementClass}`) : null;
}

window.IDS = IDS;
window.CLASSES = CLASSES;
window.MUSIC_PLAYER = MUSIC_PLAYER;
window.NAVBAR = NAVBAR;
window.MODALS = MODALS;
window.ROUTES = ROUTES;
window.THEMES = THEMES;
window.STORAGE_KEYS = STORAGE_KEYS;
window.ICONS = ICONS;
window.AUDIO_FORMATS = AUDIO_FORMATS;
window.REPEAT_MODES = REPEAT_MODES;
window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
window.TOAST_ICONS = TOAST_ICONS;
window.TOAST_STYLES = TOAST_STYLES;
window.$ = $;
window.$byId = $byId;
window.$bySelector = $bySelector;
window.$allBySelector = $allBySelector;
window.$inContext = $inContext;
window.getElement = getElement;
window.getElements = getElements;
window.getElementInContext = getElementInContext;