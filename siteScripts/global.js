import { IDS, CLASSES, ROUTES, THEMES, STORAGE_KEYS, ICONS, AUDIO_FORMATS, REPEAT_MODES, NOTIFICATION_TYPES, $, $byId } from "./map.js";
import { music } from "../modules/library.js";
import { render, create } from "./utilities/templates.js";
import { encodeURIComponent } from './utilities/parsers.js';






const ACTION_GRID_ITEMS = [
  { id: 'play-next', icon: 'M9 5l7 7-7 7M15 5v14', label: 'Play Next' },
  { id: 'add-queue', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', label: 'Add to Queue' },
  { id: 'add-playlist', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10', label: 'Add to Playlist' },
  { id: 'share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z', label: 'Share' },
  { id: 'download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', label: 'Download' },
  { id: 'view-artist', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'View Artist' }
];

class AppState {
  constructor() {
    this.audio = null;
    this.currentSong = null;
    this.currentArtist = null;
    this.currentAlbum = null;
    this.isPlaying = false;
    this.duration = 0;
    this.recentlyPlayed = [];
    this.isDragging = false;
    this.shuffleMode = false;
    this.repeatMode = REPEAT_MODES.OFF;
    this.seekTooltip = null;
    this.currentIndex = 0;
    this.playlists = [];
    this.isPopupVisible = false;
    this.currentTab = "now-playing";
    this.inactivityTimer = null;
    this.notificationContainer = null;
    this.notifications = [];
    this.currentNotificationTimeout = null;
    this.siteMapInstance = null;
    this.homePageManagerInstance = null;
  }

favorites = {
  songs: new Set(),
  artists: new Set(),
  albums: new Set(),

  add: (type, id) => {
    appState.favorites[type].add(id);
    appState.favorites.save(type);
    appState.favorites.updateIcon(type, id, true);
    const itemName = type === "songs" ? "song" : type.slice(0, -1);
    notifications.show(`Added ${itemName} to favorites`, NOTIFICATION_TYPES.SUCCESS);
  },

  remove: (type, id) => {
    appState.favorites[type].delete(id);
    appState.favorites.save(type);
    appState.favorites.updateIcon(type, id, false);
    const itemName = type === "songs" ? "song" : type.slice(0, -1);
    notifications.show(`Removed ${itemName} from favorites`, NOTIFICATION_TYPES.INFO);
  },

  toggle: (type, id) => {
    if (appState.favorites[type].has(id)) {
      appState.favorites.remove(type, id);
      return false;
    } else {
      appState.favorites.add(type, id);
      return true;
    }
  },

  has: (type, id) => appState.favorites[type].has(id),

  save: (type) => {
    const key = type === "songs" ? STORAGE_KEYS.FAVORITE_SONGS : type === "artists" ? STORAGE_KEYS.FAVORITE_ARTISTS : STORAGE_KEYS.FAVORITE_ALBUMS;
    storage.save(key, Array.from(appState.favorites[type]));
  },

  updateIcon: (type, id, isFavorite) => {
    const icons = document.querySelectorAll(`[data-favorite-${type}="${id}"]`);
    icons.forEach((icon) => {
      icon.classList.toggle("favorited", isFavorite);
      icon.classList.toggle(CLASSES.active, isFavorite);
      icon.setAttribute("aria-pressed", isFavorite);
      if (type === "songs") {
        const heartIcon = icon.querySelector("svg");
        if (heartIcon) {
          heartIcon.style.color = isFavorite ? "#ef4444" : "";
          heartIcon.style.fill = isFavorite ? "currentColor" : "none";
        }
      }
    });
    if (type === "songs" && appState.currentSong && appState.currentSong.id === id) {
      ui.updateFavoriteButton();
    }
  },
};

queue = {
  items: [],

  add: (song, position = null) => {
    if (position !== null) {
      this.queue.items.splice(position, 0, song);
    } else {
      this.queue.items.push(song);
    }
    
    storage.save(STORAGE_KEYS.QUEUE, this.queue.items);
    ui.updateCounts();
    notifications.show(`Added "${song.title}" to queue`);
  },

  remove: (index) => {
    if (index >= 0 && index < this.queue.items.length) {
      const removed = this.queue.items.splice(index, 1)[0];
      storage.save(STORAGE_KEYS.QUEUE, this.queue.items);
      ui.updateCounts();
      return removed;
    }
    return null;
  },

  clear: () => {
    this.queue.items = [];
    storage.save(STORAGE_KEYS.QUEUE, this.queue.items);
    ui.updateCounts();
  },

  getNext: () => {
    return this.queue.items.length > 0 ? this.queue.remove(0) : null;
  },

  get: () => this.queue.items,

  playAt: (index) => {
    const song = this.queue.remove(index);
    if (song) {
      player.playSong(song);
    }
  },
};

}

const appState = new AppState();

const utils = {
  formatTime: (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  },

  normalizeForUrl: (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "");
  },

  getAlbumImageUrl: (albumName) => {
    if (!albumName) return utils.getDefaultAlbumImage();
    const normalized = utils.normalizeForUrl(albumName);
    return `https://koders.cloud/global/content/images/albumCovers/${normalized}.png`;
  },

  getArtistImageUrl: (artistName) => {
    if (!artistName) return utils.getDefaultArtistImage();
    const normalized = utils.normalizeForUrl(artistName);
    return `https://koders.cloud/global/content/images/artistPortraits/${normalized}.png`;
  },

  getDefaultAlbumImage: () => {
    return "https://koders.cloud/global/content/images/albumCovers/default-album.png";
  },

  getDefaultArtistImage: () => {
    return "https://koders.cloud/global/content/images/artistPortraits/default-artist.png";
  },

  getTotalSongs: (artist) => {
    return artist.albums.reduce((total, album) => total + album.songs.length, 0);
  },

  loadImageWithFallback: (imgElement, primaryUrl, fallbackUrl, type = "image") => {
    if (!imgElement) return;

    imgElement.classList.add(CLASSES.imageLoading);

    const testImage = new Image();

    testImage.onload = () => {
      imgElement.src = primaryUrl;
      imgElement.classList.remove(CLASSES.imageLoading, CLASSES.imageError);
      imgElement.classList.add(CLASSES.imageLoaded);
    };

    testImage.onerror = () => {
      const fallbackImage = new Image();

      fallbackImage.onload = () => {
        imgElement.src = fallbackUrl;
        imgElement.classList.remove(CLASSES.imageLoading);
        imgElement.classList.add(CLASSES.imageLoaded);
      };

      fallbackImage.onerror = () => {
        imgElement.src = utils.generatePlaceholder(type);
        imgElement.classList.remove(CLASSES.imageLoading);
        imgElement.classList.add(CLASSES.imageFallback);
      };

      fallbackImage.src = fallbackUrl;
    };

    testImage.src = primaryUrl;
  },

  generatePlaceholder: (type) => {
    const isArtist = type === "artist";
    const bgColor = isArtist ? "#4F46E5" : "#059669";
    const icon = isArtist
      ? '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'
      : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>';

    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${bgColor}"/>
      <svg x="75" y="75" width="50" height="50" viewBox="0 0 24 24" fill="white">
        ${icon}
      </svg>
    </svg>`;

    return "data:image/svg+xml;base64," + btoa(svg);
  },



getSimilarArtists: (artistName, { limit = 12, includeSelf = false } = {}) => {
  const lib = Array.isArray(typeof music !== 'undefined' ? music : null) ? music : (Array.isArray(window.music) ? window.music : []);
  if (!Array.isArray(lib) || !lib.length) return [];
  const artist = lib.find(a => a.artist === artistName);
  if (!artist || !Array.isArray(artist.similar)) return [];
  const arr = includeSelf ? artist.similar.slice() : artist.similar.filter(n => n !== artistName);
  return Array.from(new Set(arr)).slice(0, limit);
},


  scrollToTop: () => {
    
    let area = document.getElementById('pageWrapper');
    area.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  },
};





const loadingBar = {
  element: null,
  activeTimers: [],

  initialize: () => {
    if (loadingBar.element) return;
    loadingBar.element = document.createElement('div');
    loadingBar.element.className = 'loading-bar';
    document.body.appendChild(loadingBar.element);
  },

  start: () => {
    loadingBar.initialize();
    loadingBar.clearTimers();
    loadingBar.element.classList.remove('complete');
    loadingBar.element.classList.add('active');
    loadingBar.element.style.transform = 'scaleX(0.05)';

    const steps = Math.floor(Math.random() * 3) + 3;
    let progress = 0.05;

    for (let i = 1; i <= steps; i++) {
      const delay = 150 * i + Math.random() * 300;
      const increment = 0.2 + Math.random() * 0.25;
      progress = Math.min(progress + increment, 0.9);

      const timer = setTimeout(() => {
        if (loadingBar.element.classList.contains('active')) {
          loadingBar.element.style.transform = `scaleX(${progress})`;
        }
      }, delay);

      loadingBar.activeTimers.push(timer);
    }
  },

  complete: () => {
    if (!loadingBar.element) return;
    loadingBar.clearTimers();

    loadingBar.element.style.transform = 'scaleX(1)';
    loadingBar.element.classList.add('complete');

    const timer = setTimeout(() => {
      loadingBar.element.classList.remove('active', 'complete');
      loadingBar.element.style.transform = 'scaleX(0)';
    }, 400 + Math.random() * 200);

    loadingBar.activeTimers.push(timer);
  },

  hide: () => {
    if (!loadingBar.element) return;
    loadingBar.clearTimers();
    loadingBar.element.classList.remove('active', 'complete');
    loadingBar.element.style.transform = 'scaleX(0)';
  },

  clearTimers: () => {
    loadingBar.activeTimers.forEach((t) => clearTimeout(t));
    loadingBar.activeTimers = [];
  }
};

const pageUpdates = {
  breadCrumbs: (items, options = {}) => {
    const {
      containerId = ".breadcrumb-list",
      showIcons = false,
      truncateAfter = null,
      animateChanges = true,
      schemaMarkup = false
    } = options;

    const list = document.querySelector(containerId);
    if (!list) return;

    const prev = animateChanges ? list.innerHTML : null;
    list.innerHTML = "";

    let display = items;
    if (truncateAfter && items.length > truncateAfter + 1) {
      display = [items[0], { text: "...", isEllipsis: true }, ...items.slice(-(truncateAfter - 1))];
    }

    display.forEach((item, index) => {
      if (item.isEllipsis) {
        const li = document.createElement("li");
        li.className = "breadcrumb-item";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "breadcrumb-link";
        btn.setAttribute("aria-label", "Show all breadcrumb items");
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 13a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z"/></svg>';
        btn.addEventListener("click", () => {
          pageUpdates.breadCrumbs(items, { ...options, truncateAfter: null });
        });
        li.appendChild(btn);
        list.appendChild(li);
        return;
      }

      const li = document.createElement("li");
      li.className = "breadcrumb-item";
      if (schemaMarkup) {
        li.setAttribute("itemprop", "itemListElement");
        li.setAttribute("itemscope", "");
        li.setAttribute("itemtype", "https://schema.org/ListItem");
      }
      if (item.active) li.classList.add("active");

      const el = document.createElement("button");
      el.type = "button";
      el.className = "breadcrumb-link";
      if (item.active) {
        el.setAttribute("aria-current", "page");
        el.disabled = true;
      }
      if (schemaMarkup) el.setAttribute("itemprop", "item");

      let html = "";
      if (item.icon) {
        html += `<span class="SVGimg">${item.icon}</span>`;
      } else if (item.isHome || (index === 0 && showIcons)) {
        html += '<svg class="SVGimg" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0V14a1 1 0 011-1h2a1 1 0 011 1v7"/></svg>';
      }
      html += schemaMarkup ? `<span itemprop="name">${item.text}</span>` : item.text;
      el.innerHTML = html;

      if (!item.active) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (item.onClick) { item.onClick(); return; }
          if (appState.siteMapInstance) {
            if (item.route) {
              if (item.route === ROUTES.HOME) appState.siteMapInstance.navigateTo(ROUTES.HOME);
              else if (item.route === ROUTES.ARTIST && item.artist) appState.siteMapInstance.navigateTo(ROUTES.ARTIST, { artist: item.artist });
              else if (item.route === ROUTES.ALL_ARTISTS) appState.siteMapInstance.navigateTo(ROUTES.ALL_ARTISTS);
            } else {
              if (item.text === "Home" || item.isHome) appState.siteMapInstance.navigateTo(ROUTES.HOME);
              else if (item.artist) appState.siteMapInstance.navigateTo(ROUTES.ARTIST, { artist: item.artist });
              else if (item.text === "All Artists") appState.siteMapInstance.navigateTo(ROUTES.ALL_ARTISTS);
            }
          }
        });
      }

      li.appendChild(el);
      if (schemaMarkup) {
        const meta = document.createElement("meta");
        meta.setAttribute("itemprop", "position");
        meta.setAttribute("content", (index + 1).toString());
        li.appendChild(meta);
      }
      list.appendChild(li);
    });

    if (animateChanges) {
      const wrapper = list.closest(".breadcrumb-wrapper");
      if (wrapper) {
        wrapper.classList.add("breadcrumb-fade-in");
        setTimeout(() => wrapper.classList.remove("breadcrumb-fade-in"), 300);
      }
    }
  }
};

const progressBarModule = (() => {
  const CONFIG = {
    skipSteps: {
      arrowRight: 5,
      arrowLeft: -5,
      pageUp: 10,
      pageDown: -10
    }
  };
  let elements = {
    bar: null,
    fill: null,
    thumb: null,
    buffer: null,
    currentTime: null,
    totalTime: null
  };
  let state = {
    audio: null,
    isDragging: false,
    isInitialized: false
  };
  const queryElements = () => {
    elements.bar = document.getElementById("progressBar");
    elements.fill = document.getElementById("progressFill");
    elements.thumb = document.getElementById("progressThumb");
    elements.buffer = document.getElementById("progressBuffer");
    elements.currentTime = document.getElementById("currentTime");
    elements.totalTime = document.getElementById("totalTime");

    const allElementsFound = Object.values(elements).every(element => element !== null);
    
    if (!allElementsFound) {
      console.warn('Progress bar: One or more required elements not found');
      return false;
    }

    if (elements.thumb.parentElement !== elements.bar) {
      elements.bar.appendChild(elements.thumb);
    }

    return true;
  };
  const getAudioElement = () => {
    if (state.audio) return state.audio;
    
    // Try multiple ways to find audio element
    if (window.appState && window.appState.audio) {
      state.audio = window.appState.audio;
    } else {
      state.audio = document.querySelector("audio");
    }
    
    return state.audio;
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const getPositionFromX = (clientX) => {
    const rect = elements.bar.getBoundingClientRect();
    return clamp((clientX - rect.left) / rect.width);
  };

  const updateProgressLayout = (progress) => {
    const percentage = (progress * 100).toFixed(4) + '%';
    
    elements.fill.style.width = percentage;
    elements.thumb.style.left = percentage;
    elements.bar.setAttribute('aria-valuenow', Math.round(progress * 100));
    
    // Update ARIA label for better accessibility
    const audio = getAudioElement();
    if (audio) {
      const currentTime = formatTime(audio.currentTime || 0);
      const duration = formatTime(audio.duration || 0);
      elements.bar.setAttribute('aria-label', `Progress: ${currentTime} of ${duration}`);
    }
  };
  const updateTimeDisplay = () => {
    const audio = getAudioElement();
    if (!audio) return;
    
    const duration = audio.duration || 0;
    const currentTime = audio.currentTime || 0;
    
    elements.currentTime.textContent = formatTime(currentTime);
    elements.totalTime.textContent = formatTime(duration);
  };
  const updateProgressDisplay = () => {
    if (state.isDragging) return;
    
    const audio = getAudioElement();
    if (!audio) return;
    
    const duration = audio.duration || 0;
    const currentTime = audio.currentTime || 0;
    const progress = duration > 0 ? currentTime / duration : 0;
    
    updateProgressLayout(progress);
  };
  const updateBufferDisplay = () => {
    const audio = getAudioElement();
    
    if (!audio || !audio.buffered || audio.buffered.length === 0) {
      elements.buffer.style.width = '0%';
      return;
    }
    
    const duration = audio.duration || 0;
    let bufferedEnd = 0;
    
    // Find the furthest buffered point
    for (let i = 0; i < audio.buffered.length; i++) {
      const end = audio.buffered.end(i);
      if (end > bufferedEnd) bufferedEnd = end;
    }
    
    const bufferProgress = duration > 0 ? clamp(bufferedEnd / duration) : 0;
    elements.buffer.style.width = (bufferProgress * 100).toFixed(2) + '%';
  };

  const seekToPercentage = (percentage) => {
    const audio = getAudioElement();
    if (!audio) return;
    
    const duration = audio.duration || 0;
    audio.currentTime = duration * clamp(percentage);
    updateTimeDisplay();
  };
  const handlePointerDown = (event) => {
    if (!getAudioElement()) return;
    
    state.isDragging = true;
    elements.bar.setPointerCapture?.(event.pointerId);
    updateProgressLayout(getPositionFromX(event.clientX));
    
    // Add visual feedback
    elements.bar.classList.add('dragging');
  };
  const handlePointerMove = (event) => {
    if (!state.isDragging) return;
    updateProgressLayout(getPositionFromX(event.clientX));
  };
  const handlePointerUp = (event) => {
    if (!state.isDragging) return;
    
    state.isDragging = false;
    elements.bar.releasePointerCapture?.(event.pointerId);
    seekToPercentage(getPositionFromX(event.clientX));
    
    // Remove visual feedback
    elements.bar.classList.remove('dragging');
  };
  const handleClick = (event) => {
    if (state.isDragging || !getAudioElement()) return;
    seekToPercentage(getPositionFromX(event.clientX));
  };
  const handleKeyDown = (event) => {
    const audio = getAudioElement();
    if (!audio) return;
    
    const duration = audio.duration || 0;
    if (!duration) return;
    
    let timeChange = 0;
    
    switch (event.key) {
      case 'ArrowRight':
        timeChange = CONFIG.skipSteps.arrowRight;
        break;
      case 'ArrowLeft':
        timeChange = CONFIG.skipSteps.arrowLeft;
        break;
      case 'PageUp':
        timeChange = CONFIG.skipSteps.pageUp;
        break;
      case 'PageDown':
        timeChange = CONFIG.skipSteps.pageDown;
        break;
      case 'Home':
        audio.currentTime = 0;
        event.preventDefault();
        return;
      case 'End':
        audio.currentTime = duration;
        event.preventDefault();
        return;
      default:
        return; // Ignore other keys
    }
    
    if (timeChange !== 0) {
      const newTime = clamp((audio.currentTime + timeChange) / duration) * duration;
      audio.currentTime = newTime;
      event.preventDefault();
    }
  };

  const bindAudioEvents = () => {
    const audio = getAudioElement();
    if (!audio) return;
    
    const events = [
      'timeupdate', 'durationchange', 'progress', 'loadedmetadata',
      'seeking', 'seeked', 'play', 'pause'
    ];
    
    const updateAll = () => {
      updateTimeDisplay();
      updateProgressDisplay();
      updateBufferDisplay();
    };
    
    // Bind events that require full updates
    events.forEach(event => {
      audio.addEventListener(event, updateAll);
    });
    
    // More frequent updates during playback
    audio.addEventListener('timeupdate', updateProgressDisplay);
    audio.addEventListener('progress', updateBufferDisplay);
  };

  const initialize = () => {
    if (state.isInitialized) return;
    
    if (!queryElements()) {
      console.warn('Progress bar: Initialization failed - elements not found');
      return;
    }
    
    // Set up accessibility
    elements.bar.setAttribute('role', 'slider');
    elements.bar.setAttribute('aria-valuemin', '0');
    elements.bar.setAttribute('aria-valuemax', '100');
    elements.bar.setAttribute('aria-valuenow', '0');
    elements.bar.setAttribute('aria-label', 'Audio progress');
    elements.bar.tabIndex = 0;
    
    // Bind events
    elements.bar.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    elements.bar.addEventListener('click', handleClick);
    elements.bar.addEventListener('keydown', handleKeyDown);
    
    // Bind audio events
    bindAudioEvents();
    
    // Initial render
    updateTimeDisplay();
    updateBufferDisplay();
    updateProgressDisplay();
    
    state.isInitialized = true;
  };

  return {
    init: initialize,
    
    attach: (audioElement) => {
      state.audio = audioElement;
      initialize();
    },
    
    seekToPercentage: seekToPercentage,
    
    refresh: () => {
      updateTimeDisplay();
      updateBufferDisplay();
      updateProgressDisplay();
    },

////////  CleanUp  ///// 
    destroy: () => {
      if (!state.isInitialized) return;
      
      elements.bar.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      elements.bar.removeEventListener('click', handleClick);
      elements.bar.removeEventListener('keydown', handleKeyDown);
      
      const audio = getAudioElement();
      if (audio) {
        audio.removeEventListener('timeupdate', updateProgressDisplay);
        audio.removeEventListener('progress', updateBufferDisplay);
      }
      
      state.isInitialized = false;
    },
    
    isInitialized: () => state.isInitialized
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    progressBarModule.init();
//    theme.initialize();
    });
} else {
  progressBarModule.init();
//  theme.initialize();
}

const overlays = {
//
//  Globally  
  open: (id, content, type = 'default') => {
    let modal = document.getElementById(id);
    if (!modal) {
      modal = document.createElement("dialog");
      modal.id = id;
      modal.className = `modal ${type}`;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="close" data-close>&times;</div>
      <div class="content">${content}</div>
    `;
    
    modal.classList.remove('closing');
    
    modal.querySelector("[data-close]").addEventListener("click", () => overlays.close(id), { once: true });
    modal.addEventListener('cancel', (e) => {
      e.preventDefault();
      overlays.close(id);
    });
    
    modal.showModal();
    modal.offsetHeight;
    requestAnimationFrame(() => modal.setAttribute('open', ''));
  },
  close: (id) => {
    const modal = document.getElementById(id);
    if (modal && modal.open) {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.close();
        modal.classList.remove('closing');
        modal.removeAttribute('open');
      }, 250);
    }
  },



/**
 *  Warning PopUps
 *  Confirmation PopUps
 *  Error Messages
 */  
  dialog: {
    confirm(message, { okText = "OK", cancelText = "Cancel", danger = false } = {}) {
      return new Promise((resolve) => {
        const id = "confirm-dialog";
        overlays.open(
          id,
          `
          <div class="header">${message}</div>
          <div class="actions">
            <button class="btn muted" data-cancel>${cancelText}</button>
            <button class="btn ${danger ? "danger" : "primary"}" data-ok>${okText}</button>
          </div>
          `,
          'dialog'
        );
        
        const modal = document.getElementById(id);
        
        const handleCancel = () => {
          overlays.close(id);
          setTimeout(() => resolve(false), 250);
        };
        
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(true), 250);
        };
        
        modal.querySelector("[data-cancel]").addEventListener("click", handleCancel, { once: true });
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    },

    alert(message, { okText = "OK" } = {}) {
      return new Promise((resolve) => {
        const id = "alert-dialog";
        overlays.open(
          id,
          `
          <div class="header">${message}</div>
          <div class="actions">
            <button class="btn primary" data-ok>${okText}</button>
          </div>
          `,
          'dialog'
        );
        
        const modal = document.getElementById(id);
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(), 250);
        };
        
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    }
  },



/**
 *   Form Submissions
 *   Editing netadata
 *   Renaming playlists
 */
  form: {
    prompt(message, { okText = "Create", cancelText = "Cancel", placeholder = "", value = "" } = {}) {
      return new Promise((resolve) => {
        const id = "prompt-form";
        overlays.open(
          id,
          `
          <div class="header">${message}</div>
          <div class="body">
            <input class="input" type="text" placeholder="${placeholder}" value="${value}">
          </div>
          <div class="actions">
            <button class="btn muted" data-cancel>${cancelText}</button>
            <button class="btn primary" data-ok>${okText}</button>
          </div>
          `,
          'form'
        );
        
        const modal = document.getElementById(id);
        const input = modal.querySelector(".input");
        
        setTimeout(() => input.focus(), 100);
        
        const handleCancel = () => {
          overlays.close(id);
          setTimeout(() => resolve(null), 250);
        };
        
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(input.value.trim() || null), 250);
        };
        
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleOk();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
          }
        });
        
        modal.querySelector("[data-cancel]").addEventListener("click", handleCancel, { once: true });
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    }
  },



/**
 *   iFrame Modals
 *   All playlists gallery display
 *   Favorite Artists gallery display
 */
  viewer: {
    playlists(content) {
      overlays.open('playlist-viewer', content, 'viewer playlist');
    },
    
    artists(content) {
      overlays.open('artist-viewer', content, 'viewer artist');
    }
  }
};

const musicPlayer = {
  open() {
    const drawer = document.querySelector('.drawer');
    if (!drawer) return;
    
    drawer.showPopover();
    appState.isPopupVisible = true;
    this.updateTabContent(appState.currentTab || 'playing');
  },
  
  close() {
    const drawer = document.querySelector('.drawer');
    if (!drawer) return;
    
    drawer.hidePopover();
    appState.isPopupVisible = false;
    setTimeout(() => this.switchTab("playing"), 50);
  },
  
  toggle() {
    const drawer = document.querySelector('.drawer');
    if (!drawer) return;
    
    if (drawer.matches(':popover-open')) {
      this.close();
    } else {
      this.open();
    }
  },
  
  switchTab(tabName) {
    appState.currentTab = tabName;
    
    document.querySelectorAll('.tabsContainer .tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    document.querySelectorAll('#musicPlayer .body .content[data-tab]').forEach(content => {
      content.classList.toggle('active', content.dataset.tab === tabName);
    });
    
    this.updateTabContent(tabName);
  },
  
  updateTabContent(tabName) {
    if (tabName === 'recent') this.updateRecentTab();
    else if (tabName === 'queue') this.updateQueueTab();
  },
  
  updateQueueTab() {
    const queueList = document.getElementById('queueList');
    if (!queueList) return;
    
    const emptyState = queueList.querySelector('.empty');
    
    if (appState.queue.items.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      const items = queueList.querySelectorAll('li:not(.empty)');
      items.forEach(item => item.remove());
      return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    const existingItems = queueList.querySelectorAll('li:not(.empty)');
    existingItems.forEach(item => item.remove());
    
    appState.queue.items.forEach((song, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'songItem';
      listItem.dataset.index = index;
      listItem.dataset.song = JSON.stringify(song);
      
      listItem.innerHTML = `
        <div class="songContent">
          <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="songCover">
          <div class="songInfo">
            <div class="songTitle">${song.title}</div>
            <div class="artistName">${song.artist}</div>
          </div>
          <div class="songActions">
            <button class="playButton" data-action="play" title="Play now">
              <svg class="SVGimg" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
            </button>
            <button class="removeButton" data-action="remove" title="Remove from queue">
              <svg class="SVGimg" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      `;
      
      const playBtn = listItem.querySelector('[data-action="play"]');
      if (playBtn) {
        playBtn.addEventListener('click', e => { 
          e.stopPropagation(); 
          appState.queue.playAt(index); 
        });
      }
      
      const removeBtn = listItem.querySelector('[data-action="remove"]');
      if (removeBtn) {
        removeBtn.addEventListener('click', e => { 
          e.stopPropagation(); 
          appState.queue.remove(index); 
          this.updateQueueTab(); 
          ui.updateCounts(); 
        });
      }
      
      listItem.addEventListener('click', () => appState.queue.playAt(index));
      queueList.appendChild(listItem);
    });
  },
  
  updateRecentTab() {
    const recentList = document.getElementById('recentList');
    if (!recentList) return;
    
    const emptyState = recentList.querySelector('.empty');
    
    if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      const items = recentList.querySelectorAll('li:not(.empty)');
      items.forEach(item => item.remove());
      return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    const existingItems = recentList.querySelectorAll('li:not(.empty)');
    existingItems.forEach(item => item.remove());
    
    appState.recentlyPlayed.slice(0, 20).forEach((song, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'songItem';
      listItem.dataset.index = index;
      listItem.dataset.song = JSON.stringify(song);
      
      listItem.innerHTML = `
        <div class="songContent">
          <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="songCover">
          <div class="songInfo">
            <div class="songTitle">${song.title}</div>
            <div class="artistName">${song.artist}</div>
          </div>
          <div class="songActions">
            <button class="playButton" data-action="play" title="Play now">
              <svg class="SVGimg" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
            </button>
            <button class="queueButton" data-action="queue" title="Add to queue">
              <svg class="SVGimg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </button>
          </div>
        </div>
      `;
      
      const playBtn = listItem.querySelector('[data-action="play"]');
      if (playBtn) {
        playBtn.addEventListener('click', e => { 
          e.stopPropagation(); 
          player.playSong(song); 
        });
      }
      
      const queueBtn = listItem.querySelector('[data-action="queue"]');
      if (queueBtn) {
        queueBtn.addEventListener('click', e => { 
          e.stopPropagation(); 
          appState.queue.add(song); 
          notifications.show(`Added "${song.title}" to queue`); 
        });
      }
      
      listItem.addEventListener('click', () => player.playSong(song));
      recentList.appendChild(listItem);
    });
  },
  
  preventHorizontalScroll() {
    const musicPlayerElement = document.getElementById('musicPlayer');
    if (!musicPlayerElement) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const deltaX = Math.abs(e.touches[0].clientX - startX);
      const deltaY = Math.abs(e.touches[0].clientY - startY);
      
      if (deltaX > deltaY) {
        e.preventDefault();
      }
    };

    musicPlayerElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    musicPlayerElement.addEventListener('touchmove', handleTouchMove, { passive: false });

    musicPlayerElement.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    }, { passive: false });
  },
  
  initDrawerDrag() {
    const drawerScroller = document.querySelector('.drawerScroller');
    const drawer = document.querySelector('.drawer');
    
    if (!drawerScroller || !drawer) return;
    
    let isDragging = false;
    let startY = 0;
    let currentY = 0;
    
    const handleTouchStart = (e) => {
      isDragging = true;
      startY = e.touches[0].clientY;
      currentY = startY;
      drawerScroller.style.scrollSnapType = 'none';
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isDragging) return;
      
      isDragging = false;
      drawerScroller.style.scrollSnapType = 'y mandatory';
      
      const deltaY = currentY - startY;
      
      if (deltaY > 5) {
        this.close();
      } else {
        drawerScroller.scrollTo({
          top: drawerScroller.scrollTop,
          behavior: 'smooth'
        });
      }
    };
    
    drawerScroller.addEventListener('touchstart', handleTouchStart, { passive: true });
    drawerScroller.addEventListener('touchmove', handleTouchMove, { passive: false });
    drawerScroller.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    drawerScroller.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      currentY = startY;
      drawerScroller.style.scrollSnapType = 'none';
    });
    
    drawerScroller.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      currentY = e.clientY;
      const deltaY = currentY - startY;
      if (deltaY > 0) {
        e.preventDefault();
      }
    });
    
    drawerScroller.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      drawerScroller.style.scrollSnapType = 'y mandatory';
      
      const deltaY = currentY - startY;
      if (deltaY > 5) {
        this.close();
      }
    });
    
    drawerScroller.addEventListener('mouseleave', (e) => {
      if (isDragging) {
        isDragging = false;
        drawerScroller.style.scrollSnapType = 'y mandatory';
        this.close();
      }
    });
  },
  
  init() {
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    document.querySelectorAll('.tabsContainer .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        if (tabName) this.switchTab(tabName);
      });
    });
    
    const queueBtn = document.getElementById('queueBtn');
    if (queueBtn) {
      queueBtn.addEventListener('click', () => this.switchTab('queue'));
    }
    
    this.preventHorizontalScroll();
    this.initDrawerDrag();
  }
};

const loadArtistInfo = (artistName, albumName = null) => {
  if (!window.music) return;
  
  const artistData = window.music.find(a => a.artist === artistName);
  if (!artistData) return;
  
  // If albumName is provided, find and activate that album tab
  if (albumName && artistData.albums) {
    const albumIndex = artistData.albums.findIndex(album => album.album === albumName);
    if (albumIndex !== -1) {
      // Wait for the artist page to render, then activate the album tab
      setTimeout(() => {
        const albumTabs = document.querySelectorAll('.album-tab');
        if (albumTabs.length > albumIndex) {
          albumTabs[albumIndex].click();
        }
      }, 1000);
    }
  }
};



  const pageManager = {
    dependencies: {
      // Helper functions - EXACTLY matching original functionality
      getParameterByName: (name, url) => {
        name = name.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
      },

      getSimilarArtists: (artistName, options = {}) => {
        return utils.getSimilarArtists(artistName, options);
      },

      getTotalSongs: (artistData) => {
        return utils.getTotalSongs(artistData);
      },

      scrollToTop: () => {
        utils.scrollToTop();
      },

      showNotification: (message, type = NOTIFICATION_TYPES.INFO) => {
        notifications.show(message, type);
      },

      getArtistImageUrl: (artistName) => {
        return utils.getArtistImageUrl(artistName);
      },

      getAlbumImageUrl: (albumName) => {
        return utils.getAlbumImageUrl(albumName);
      },

      createElement: (html) => {
        return create(html);
      },

      findElement: (id) => {
        return $byId(id);
      },

      // ADDED: Missing utility functions from original
      showLoading: () => {
        loadingBar.start();
        
        const contentLoading = $byId(IDS.contentLoading);
        if (contentLoading) {
          contentLoading.classList.remove(CLASSES.hidden);
          setTimeout(() => {
            contentLoading.classList.add(CLASSES.hidden);
            loadingBar.complete();
          }, 800);
        } else {
          setTimeout(() => {
            loadingBar.complete();
          }, 600);
        }
      }
    },

    fragments: {
      // Page rendering fragments - IDENTICAL to original
      renderArtistPage: (artistData) => {
        const dynamicContent = $byId(IDS.dynamicContent);
        if (!dynamicContent) return;
        
        dynamicContent.innerHTML = render.artist("enhancedArtist", {
          artist: artistData.artist,
          cover: utils.getArtistImageUrl(artistData.artist),
          genre: artistData.genre || '',
          albumCount: artistData.albums.length,
          songCount: utils.getTotalSongs(artistData)
        });
        
        pageManager.fragments.setupAlbumsSection(artistData);
        
        // IDENTICAL breadcrumbs from original
        pageUpdates.breadCrumbs(
          [
            { 
              text: "Home  ", 
              route: ROUTES.HOME, 
              active: false, 
              isHome: true, 
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path class="fa-secondary" d="M80 202.9L80 448c0 26.5 21.5 48 48 48l80 0 0-168c0-13.3 10.7-24 24-24l112 0c13.3 0 24 10.7 24 24l0 168 80 0c26.5 0 48-21.5 48-48l0-245.1L288 18.7 80 202.9z"/><path class="fa-primary" d="M293.3 2c-3-2.7-7.6-2.7-10.6 0L2.7 250c-3.3 2.9-3.6 8-.7 11.3s8 3.6 11.3 .7L64 217.1 64 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-230.9L562.7 262c3.3 2.9 8.4 2.6 11.3-.7s2.6-8.4-.7-11.3L293.3 2zM80 448l0-245.1L288 18.7 496 202.9 496 448c0 26.5-21.5 48-48 48l-80 0 0-168c0-13.3-10.7-24-24-24l-112 0c-13.3 0 24 10.7 24 24l0 168-80 0c-26.5 0-48-21.5-48-48zm144 48l0-168c0-4.4 3.6-8 8-8l112 0c4.4 0 8 3.6 8 8l0 168-128 0z"/></svg>' 
            },
            { 
              text: "  Discography", 
              route: ROUTES.ARTIST, 
              artist: artistData.artist, 
              active: true, 
              icon: '' 
            }
          ],
          { showIcons: true, truncateAfter: 3, animateChanges: true, schemaMarkup: true }
        );
        
        const names = utils.getSimilarArtists(artistData.artist, { limit: 24 });
        pageManager.fragments.buildSimilar(names);
        pageManager.clickEvents.bindArtistPageEvents(artistData);
      },

      setupAlbumsSection: (artistData) => {
        const albumsContainer = $byId(IDS.albumsContainer);
        if (!albumsContainer || !artistData.albums.length) return;

        // IDENTICAL HTML structure from original
        albumsContainer.innerHTML = `
          <div class="albumSongListArea">
            <div class="album-buttons">
              <div class="album-selector">
                ${artistData.albums.map((album, index) => `
                  <button class="album-tab px-4 py-2 rounded-lg transition-all duration-300 ${index === 0 ? "active bg-accent-primary text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}" 
                          data-album-index="${index}" 
                          data-album-name="${album.album}">
                    <div class="flex items-center gap-2">
                      <span class="album-tab-title">${album.album}</span>
                      <span class="album-tab-year text-xs opacity-75">${album.year || ""}</span>
                    </div>
                  </button>
                `).join("")}
              </div>
            </div>
            <div class="current-album-container">
              <div id="current-album-display" class="transition-all duration-500 ease-in-out"></div>
            </div>
          </div>
        `;

        pageManager.fragments.displaySingleAlbum(artistData, 0);
        pageManager.clickEvents.bindAlbumSwitcher(artistData);
      },

      displaySingleAlbum: (artistData, albumIndex) => {
        const currentAlbumDisplay = $byId("current-album-display");
        if (!currentAlbumDisplay || !artistData.albums[albumIndex]) return;

        const album = artistData.albums[albumIndex];
        currentAlbumDisplay.style.opacity = "0";
        currentAlbumDisplay.style.transform = "translateY(10px)";

        setTimeout(() => {
          const albumId = `${artistData.artist}-${album.album}`.replace(/\s+/g, "").toLowerCase();
          currentAlbumDisplay.innerHTML = render.album("card", {
            albumId: albumId,
            album: album.album,
            cover: utils.getAlbumImageUrl(album.album),
            year: album.year || "Unknown",
            songCount: album.songs.length,
          });

          pageManager.fragments.renderAlbumSongs(currentAlbumDisplay, album, artistData.artist);
          currentAlbumDisplay.style.opacity = "1";
          currentAlbumDisplay.style.transform = "translateY(0)";
        }, 250);
      },

      renderAlbumSongs: (albumContainer, album, artistName) => {
        const songsContainer = albumContainer.querySelector(".songs-container");
        if (!songsContainer) return;

        songsContainer.innerHTML = "";

        if (!album.songs || album.songs.length === 0) {
          songsContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No songs found in this album</p>';
          return;
        }

        album.songs.forEach((song, index) => {
          const songData = {
            ...song,
            artist: artistName,
            album: album.album,
            cover: utils.getAlbumImageUrl(album.album),
          };

          const isFavorite = appState.favorites.has("songs", song.id);
          const songElement = create(
            render.songItem({
              trackNumber: index + 1,
              title: song.title,
              artist: artistName,
              duration: song.duration || "0:00",
              songData: songData,
              context: 'base',
              isFavorite: isFavorite,
              showTrackNumber: true,
              showArtist: false
            })
          );

          songsContainer.appendChild(songElement);
        });

        pageManager.clickEvents.bindSongItemEvents(songsContainer);
      },

      buildSimilar: (names) => {
        const rows = document.querySelectorAll('.similar-rows .names-row');
        const base = Array.from(new Set((names || []).map(n => String(n)).filter(Boolean)));
        if (!rows.length || !base.length) return;
        
        rows.forEach(row => {
          const speed = parseFloat(row.dataset.speed || '30') || 30;
          const gap = parseInt(row.dataset.gap || '18', 10) || 18;
          const track = document.createElement('div');
          const copyA = document.createElement('div');
          const copyB = document.createElement('div');
          
          track.className = 'names-track';
          copyA.className = 'names-copy';
          copyB.className = 'names-copy';
          track.style.setProperty('--speed', speed + 's');
          track.style.setProperty('--gap', gap + 'px');
          
          base.forEach(n => copyA.appendChild(pageManager.fragments.createArtistPill(n)));
          const rotated = base.length > 1 ? base.slice(1).concat(base[0]) : base.slice();
          rotated.forEach(n => copyB.appendChild(pageManager.fragments.createArtistPill(n)));
          
          row.innerHTML = '';
          track.appendChild(copyA);
          track.appendChild(copyB);
          row.appendChild(track);
          
          pageManager.fragments.syncRowWidth(row, copyA, gap);
          const ro = new ResizeObserver(() => pageManager.fragments.syncRowWidth(row, copyA, gap));
          ro.observe(row);
        });
      },

      createArtistPill: (name) => {
        const a = document.createElement('a');
        a.className = 'name-pill';
        a.href = '#';
        a.dataset.artist = name;
        const h4 = document.createElement('h4');
        h4.textContent = name;
        a.appendChild(h4);
        a.addEventListener('click', e => {
          e.preventDefault();
          // IDENTICAL to original: Check for loadArtistInfo first, then fallback
          if (window.loadArtistInfo) {
            window.loadArtistInfo(name);
          } else if (window.siteMap && typeof window.siteMap.renderArtistByName === 'function') {
            window.siteMap.renderArtistByName(name);
          } else {
            pageManager.routing.router.navigateToArtist(name);
          }
        });
        return a;
      },

      syncRowWidth: (row, copyA, gap) => {
        const items = Array.from(copyA.children);
        if (!items.length) return;
        const contentWidth = items.reduce((w, el) => w + el.getBoundingClientRect().width, 0);
        const totalGaps = Math.max(items.length - 1, 0) * gap;
        const half = contentWidth + totalGaps;
        const trackEl = row.querySelector('.names-track');
        if (trackEl) trackEl.style.width = (half * 2) + 'px';
      },

      renderAllArtistsPage: () => {
        const dynamicContent = $byId(IDS.dynamicContent);
        if (!dynamicContent || !window.music) return;

        dynamicContent.innerHTML = render.page("allArtists");

        const artistsGrid = $byId(IDS.artistsGrid);
        if (artistsGrid) {
          window.music.forEach((artist, index) => {
            const artistCard = document.createElement("div");
            artistCard.className = "animate__animated animate__fadeIn";
            artistCard.style.animationDelay = `${0.05 * index}s`;

            artistCard.innerHTML = render.artist("card", {
              id: artist.artist.replace(/\s+/g, "").toLowerCase(),
              artist: artist.artist,
              cover: utils.getArtistImageUrl(artist.artist),
              genre: artist.genre || "Various",
              albumCount: artist.albums.length,
            });

            artistsGrid.appendChild(artistCard);

            artistCard.querySelector(".artist-card").addEventListener("click", () => {
              pageManager.routing.router.navigateTo(ROUTES.ARTIST, { artist: artist.artist });
            });
          });
        }

        // IDENTICAL breadcrumbs from original
        pageUpdates.breadCrumbs([
          {
            text: "Home",
            route: ROUTES.HOME,
            active: false,
            isHome: true,
          },
          {
            text: "All Artists",
            route: ROUTES.ALL_ARTISTS,
            active: true,
          },
        ]);

        pageManager.clickEvents.bindAllArtistsEvents();
      }
    },

    clickEvents: {
      // Event binding functions - IDENTICAL to original
      bindArtistPageEvents: (artistData) => {
        const playButton = document.querySelector("#artistPlay");
        if (playButton) {
          playButton.addEventListener("click", () => {
            pageManager.actions.playArtistSongs(artistData);
          });
        }

        const followButton = document.querySelector("#artistFollow");
        if (followButton) {
          const isFavorite = appState.favorites.has("artists", artistData.artist);
          followButton.textContent = isFavorite ? "Unfavorite" : "Favorite";
          followButton.classList.toggle(CLASSES.active, isFavorite);
          followButton.addEventListener("click", () => {
            const wasFavorite = appState.favorites.toggle("artists", artistData.artist);
            followButton.textContent = wasFavorite ? "Unfavorite" : "Favorite";
            followButton.classList.toggle(CLASSES.active, wasFavorite);
          });
        }

        document.addEventListener("click", e => {
          const playAlbumBtn = e.target.closest(".play-album");
          if (playAlbumBtn) {
            e.stopPropagation();
            const activeTab = document.querySelector(".album-tab.active");
            if (activeTab) {
              const albumIndex = parseInt(activeTab.dataset.albumIndex);
              const album = artistData.albums[albumIndex];
              if (album) pageManager.actions.playAlbumSongs(album, artistData.artist);
            }
          }
        });
      },

      bindAlbumSwitcher: (artistData) => {
        const albumTabs = document.querySelectorAll(".album-tab");
        albumTabs.forEach((tab) => {
          tab.addEventListener("click", (e) => {
            e.preventDefault();
            const albumIndex = parseInt(tab.dataset.albumIndex);
            
            albumTabs.forEach((t) => {
              t.classList.remove("active", "bg-accent-primary", "text-white");
              t.classList.add("bg-gray-700", "text-gray-300");
            });

            tab.classList.add("active", "bg-accent-primary", "text-white");
            tab.classList.remove("bg-gray-700", "text-gray-300");

            pageManager.fragments.displaySingleAlbum(artistData, albumIndex);
          });
        });
      },

      bindAllArtistsEvents: () => {
        const artistSearch = $byId(IDS.artistSearch);
        if (artistSearch) {
          artistSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            document.querySelectorAll(".artist-card").forEach((card) => {
              const artistName = card.querySelector("h3").textContent.toLowerCase();
              const genreTag = card.querySelector(".genre-tag")?.textContent.toLowerCase() || "";
              const matches = artistName.includes(query) || genreTag.includes(query);
              card.parentElement.style.display = matches ? "block" : "none";
            });
          });
        }

        const genreFilters = $byId(IDS.genreFilters);
        if (genreFilters && window.music) {
          const genres = new Set();
          window.music.forEach((artist) => {
            if (artist.genre) genres.add(artist.genre);
          });

          genreFilters.innerHTML = "";
          Array.from(genres).sort().forEach((genre) => {
            const genreBtn = document.createElement("button");
            genreBtn.className = "px-3 py-1 text-xs font-medium rounded-full bg-bg-subtle hover:bg-bg-muted transition-colors";
            genreBtn.textContent = genre;

            genreBtn.addEventListener("click", () => {
              genreBtn.classList.toggle(CLASSES.active);
              genreBtn.classList.toggle("bg-accent-primary");
              genreBtn.classList.toggle("text-white");

              const activeFilters = Array.from(genreFilters.querySelectorAll("." + CLASSES.active)).map((btn) => btn.textContent.toLowerCase());

              document.querySelectorAll(".artist-card").forEach((card) => {
                const cardGenre = card.querySelector(".genre-tag")?.textContent.toLowerCase() || "";
                card.parentElement.style.display = activeFilters.length === 0 || activeFilters.includes(cardGenre) ? "block" : "none";
              });
            });

            genreFilters.appendChild(genreBtn);
          });
        }
      },

      bindSongItemEvents: (container) => {
        if (!container) return;

        container.querySelectorAll(".song-item").forEach((songItem) => {
          let clickCount = 0;
          let clickTimer = null;

          songItem.addEventListener("click", (e) => {
            if (e.target.closest(".song-actions") || e.target.closest("[data-action]")) return;

            clickCount++;
            if (clickCount === 1) {
              clickTimer = setTimeout(() => { clickCount = 0; }, 300);
            } else if (clickCount === 2) {
              clearTimeout(clickTimer);
              clickCount = 0;
              try {
                const songData = JSON.parse(songItem.dataset.song);
                player.playSong(songData);
              } catch (error) {
                console.error('Error playing song:', error);
              }
            }
          });

          const playButton = songItem.querySelector("[data-action='play']");
          if (playButton) {
            playButton.addEventListener("click", (e) => {
              e.stopPropagation();
              try {
                const songData = JSON.parse(songItem.dataset.song);
                player.playSong(songData);
              } catch (error) {
                console.error('Error playing song:', error);
              }
            });
          }

          const artistElement = songItem.querySelector("[data-artist]");
          if (artistElement) {
            artistElement.addEventListener("click", (e) => {
              e.stopPropagation();
              const artistName = artistElement.dataset.artist;
              pageManager.routing.router.navigateToArtist(artistName);
            });
          }

          songItem.querySelectorAll("[data-action]").forEach((actionBtn) => {
            actionBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              const action = actionBtn.dataset.action;
              const songData = JSON.parse(songItem.dataset.song);
              const context = songItem.dataset.context || 'base';

              if (action === 'more') {
                pageManager.actions.showMoreActionsPopover(actionBtn, songData, context);
              } else {
                pageManager.actions.handleSongAction(action, songData, context);
              }
            });
          });
        });
      }
    },

    actions: {
      // Action handlers - IDENTICAL to original
      playArtistSongs: (artistData) => {
        const allSongs = [];
        artistData.albums.forEach((album) => {
          album.songs.forEach((song) => {
            allSongs.push({
              ...song,
              artist: artistData.artist,
              album: album.album,
              cover: utils.getAlbumImageUrl(album.album),
            });
          });
        });

        if (allSongs.length > 0) {
          appState.queue.clear();
          allSongs.slice(1).forEach((song) => appState.queue.add(song));
          player.playSong(allSongs[0]);
        }
      },

      playAlbumSongs: (album, artistName) => {
        if (album.songs.length === 0) return;

        appState.queue.clear();
        album.songs.slice(1).forEach((song) => {
          appState.queue.add({
            ...song,
            artist: artistName,
            album: album.album,
            cover: utils.getAlbumImageUrl(album.album),
          });
        });

        player.playSong({
          ...album.songs[0],
          artist: artistName,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album),
        });
      },

      handleSongAction: (action, songData, context) => {
        switch (action) {
          case "favorite":
            const wasFavorite = appState.favorites.toggle("songs", songData.id);
            const message = wasFavorite ? `Added "${songData.title}" to your favorite music` : `Removed "${songData.title}" from your favorite music`;
            notifications.show(message, wasFavorite ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.INFO);
            break;
            
          case "play-next":
            appState.queue.add(songData, 0);
            notifications.show(`"${songData.title}" will play next`, NOTIFICATION_TYPES.SUCCESS);
            break;
            
          case "add-queue":
            appState.queue.add(songData);
            notifications.show(`Added "${songData.title}" to queue`, NOTIFICATION_TYPES.SUCCESS);
            break;
            
          case "add-playlist":
            this.showPlaylistSelector(songData);
            break;
            
          case "remove-from-playlist":
            const playlistContainer = document.querySelector('[data-playlist-id]');
            if (playlistContainer) {
              const playlistId = playlistContainer.dataset.playlistId;
              if (playlists.removeSong(playlistId, songData.id)) {
                playlists.show(playlistId);
                notifications.show(`Removed "${songData.title}" from playlist`, NOTIFICATION_TYPES.INFO);
              }
            }
            break;
            
          case "download":
            notifications.show("Download feature coming soon", NOTIFICATION_TYPES.INFO);
            break;
            
          case "share":
            pageManager.actions.shareSong(songData);
            break;
            
          case "view-artist":
            pageManager.routing.router.navigateToArtist(songData.artist);
            break;
            
          default:
            console.log(`Action ${action} not implemented yet`);
        }
      },

      showMoreActionsPopover: (triggerButton, songData, context) => {
        // IDENTICAL implementation from original
        document.querySelectorAll('.more-actions-popover').forEach(p => p.remove());
        
        const popover = document.createElement('div');
        popover.className = 'more-actions-popover';
        
        popover.innerHTML = `
          <div class="popover-grid">
            ${ACTION_GRID_ITEMS.map(action => `
              <button class="popover-action-btn" data-action="${action.id}">
                <svg class="popover-icon" viewBox="0 0 24 24">
                  <path d="${action.icon}"/>
                </svg>
                <span class="popover-label">${action.label}</span>
              </button>
            `).join('')}
          </div>
        `;
        
        document.body.appendChild(popover);
        
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };
        
        const triggerRect = triggerButton.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        
        let left = triggerRect.right + 8;
        let top = triggerRect.top;
        
        if (left + popoverRect.width > viewport.width - 16) {
          left = triggerRect.left - popoverRect.width - 8;
          if (left < 16) {
            left = Math.max(16, Math.min(
              viewport.width - popoverRect.width - 16,
              triggerRect.left + (triggerRect.width - popoverRect.width) / 2
            ));
          }
        }
        
        if (top + popoverRect.height > viewport.height - 16) {
          top = Math.max(16, viewport.height - popoverRect.height - 16);
        }
        
        top = Math.max(16, top);
        
        popover.style.left = `${left}px`;
        popover.style.top = `${top}px`;
        
        popover.querySelectorAll('.popover-action-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            popover.remove();
            pageManager.actions.handleSongAction(action, songData, context);
          });
        });
        
        const closePopover = (e) => {
          if (!popover.contains(e.target) && !triggerButton.contains(e.target)) {
            popover.remove();
            document.removeEventListener('click', closePopover);
            document.removeEventListener('keydown', escapeHandler);
          }
        };
        
        const escapeHandler = (e) => {
          if (e.key === 'Escape') {
            popover.remove();
            document.removeEventListener('click', closePopover);
            document.removeEventListener('keydown', escapeHandler);
          }
        };
        
        setTimeout(() => {
          document.addEventListener('click', closePopover);
          document.addEventListener('keydown', escapeHandler);
        }, 100);
      },

      // ADDED: Missing functions from original
      openSearchDialog: () => {
        notifications.show("Search functionality coming soon");
      },

      closeSearchDialog: () => {},

      showPlaylistSelector: (songData) => {
        // IDENTICAL implementation from original
        if (appState.playlists.length === 0) {
          // Use the dependencies version of overlays
          dependencies.overlays.dialog.confirm(
            "No playlists found. Create a new playlist?",
            { okText: "Create Playlist", cancelText: "Cancel" }
          ).then((confirmed) => {
            if (confirmed) {
              playlists.create().then((playlist) => {
                if (playlist) {
                  playlists.addSong(playlist.id, songData);
                }
              });
            }
          });
          return;
        }

        const playlistOptions = appState.playlists.map(playlist => `
          <button class="playlist-option w-full text-left p-3 rounded hover:bg-gray-700 transition-colors flex items-center gap-3" data-playlist-id="${playlist.id}">
            <div class="playlist-icon w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-medium">${playlist.name}</div>
              <div class="text-sm text-gray-400">${playlist.songs.length} songs</div>
            </div>
          </button>
        `).join('');

        const content = `
          <div class="playlist-selector">
            <h3 class="text-xl font-bold mb-4">Add to Playlist</h3>
            <div class="playlist-list max-h-64 overflow-y-auto space-y-2 mb-6">
              ${playlistOptions}
            </div>
            <div class="actions flex gap-3">
              <button class="create-new-playlist flex-1 bg-accent-primary text-white py-3 px-4 rounded hover:bg-accent-secondary transition-colors">
                <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Create New Playlist
              </button>
              <button class="cancel-playlist-selection bg-gray-600 text-white py-3 px-4 rounded hover:bg-gray-500 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        `;

        overlays.open('playlist-selector', content, 'playlist-selector');
        
        const modal = document.getElementById('playlist-selector');
        
        modal.querySelectorAll('.playlist-option').forEach(option => {
          option.addEventListener('click', () => {
            const playlistId = option.dataset.playlistId;
            playlists.addSong(playlistId, songData);
            dependencies.overlays.close('playlist-selector');
          });
        });
        
        modal.querySelector('.create-new-playlist').addEventListener('click', async () => {
          dependencies.overlays.close('playlist-selector');
          const newPlaylist = await playlists.create();
          if (newPlaylist) {
            playlists.addSong(newPlaylist.id, songData);
          }
        });
        
        modal.querySelector('.cancel-playlist-selection').addEventListener('click', () => {
          dependencies.overlays.close('playlist-selector');
        });
      },

      shareSong: (songData) => {
        // IDENTICAL implementation from original
        if (navigator.share) {
          navigator.share({
            title: songData.title,
            text: `Listen to "${songData.title}" by ${songData.artist}`,
            url: window.location.href
          }).catch(() => {
            pageManager.actions.fallbackShare(songData);
          });
        } else {
          pageManager.actions.fallbackShare(songData);
        }
      },

      fallbackShare: (songData) => {
        const shareUrl = window.location.href;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            notifications.show("Song link copied to clipboard!", NOTIFICATION_TYPES.SUCCESS);
          }).catch(() => {
            notifications.show("Share feature not available", NOTIFICATION_TYPES.WARNING);
          });
        } else {
          notifications.show("Share feature not available", NOTIFICATION_TYPES.WARNING);
        }
      }
    },

    routing: {
      // Store the router instance
      router: null,
      
      initialize: () => {
        loadingBar.initialize();
        // Create and store the router
        pageManager.routing.router = pageManager.routing.createRouter();
        appState.siteMapInstance = pageManager.routing.router;
        
        window.addEventListener("popstate", () => {
          pageManager.routing.router.handleRoute(window.location.pathname + window.location.search);
        });
        
        pageManager.routing.router.handleInitialRoute();
      },

      createRouter: () => ({
        routes: {
          [ROUTES.HOME]: {
            pattern: /^\/$/,
            handler: pageManager.pages.loadHomePage,
          },
          [ROUTES.ARTIST]: {
            pattern: /^\/artist\/(.+)$/,
            handler: (params) => {
              const artistName = params.artist || utils.getParameterByName("artist", window.location.href);
              const artistData = window.music?.find((a) => a.artist === artistName);
              if (artistData) {
                pageManager.pages.loadArtistPage(artistData);
              } else {
                pageManager.routing.router.navigateTo(ROUTES.HOME);
              }
            },
          },
          [ROUTES.ALL_ARTISTS]: {
            pattern: /^\/artists$/,
            handler: pageManager.pages.loadAllArtistsPage,
          },
        },

        handleInitialRoute: function () {
          const path = window.location.pathname + window.location.search;
          this.handleRoute(path);
        },

        handleRoute: function (path) {
          let matchedRoute = false;
          for (const key in this.routes) {
            const route = this.routes[key];
            const match = path.match(route.pattern);
            if (match) {
              const params = {};
              if (key === ROUTES.ARTIST) params.artist = decodeURIComponent(match[1]);
              route.handler(params);
              matchedRoute = true;
              break;
            }
          }
          if (!matchedRoute) pageManager.pages.loadHomePage();
        },

        navigateTo: function (routeName, params = {}) {
          let url;
          switch (routeName) {
            case ROUTES.HOME: url = "/"; break;
            case ROUTES.ARTIST: url = `/artist/${encodeURIComponent(params.artist)}`; break;
            case ROUTES.ALL_ARTISTS: url = "/artists"; break;
            default: url = "/";
          }

          window.history.pushState({}, "", url);
          if (this.routes[routeName]) this.routes[routeName].handler(params);
          pageManager.dependencies.showLoading();
        },

        navigateToArtist: function(artistName) {
          this.navigateTo(ROUTES.ARTIST, { artist: artistName });
        },

        // ADDED: Missing methods from original
        openSearchDialog: pageManager.actions.openSearchDialog,
        closeSearchDialog: pageManager.actions.closeSearchDialog
      })
    },

  pages: {
    // Page loading functions - IDENTICAL to original
    loadHomePage: () => {
      loadingBar.start();
      
      if (appState.homePageManagerInstance) {
        const dynamicContent = pageManager.dependencies.findElement(IDS.dynamicContent);
        if (dynamicContent) {
          dynamicContent.innerHTML = "";
        }

        setTimeout(() => {
          appState.homePageManagerInstance.renderHomePage();
          
          // IDENTICAL breadcrumbs from original
          pageUpdates.breadCrumbs(
            [
              {
                text: "Home",
                route: ROUTES.HOME,
                active: true,
                isHome: true,
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.7.2 --><path d="M125.2 16.1c6.2-4.4 5.4-14.8-2.2-15.6c-3.6-.4-7.3-.5-11-.5C50.1 0 0 50.1 0 112s50.1 112 112 112c32.1 0 61.1-13.5 81.5-35.2c5.2-5.6-1-14-8.6-13.2c-2.9 .3-5.9 .4-9 .4c-48.6 0-88-39.4-88-88c0-29.7 14.7-55.9 37.2-71.9zm289.9 85.3c-8.8-7.2-21.5-7.2-30.3 0l-216 176c-10.3 8.4-11.8 23.5-3.4 33.8s23.5 11.8 33.8 3.4L224 294.4 224 456c0 30.9 25.1 56 56 56l240 0c30.9 0 56-25.1 56-56l0-161.6 24.8 20.2c10.3 8.4 25.4 6.8 33.8-3.4s6.8-25.4-3.4-33.8l-216-176zM528 255.3L528 456c0 4.4-3.6 8-8 8l-240 0c-4.4 0-8-3.6-8-8l0-200.7L400 151 528 255.3zM352 312l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM248.5 12.3L236.6 44.6 204.3 56.5c-7 2.6-7 12.4 0 15l32.3 11.9 11.9 32.3c2.6 7 12.4 7 15 0l11.9-32.3 32.3-11.9c7-2.6 7-12.4 0-15L275.4 44.6 263.5 12.3c-2.6-7-12.4-7-15 0zm-145 320c-2.6-7-12.4-7-15 0L76.6 364.6 44.3 376.5c-7 2.6-7 12.4 0 15l32.3 11.9 11.9 32.3c2.6 7 12.4 7 15 0l11.9-32.3 32.3-11.9c7-2.6 7-12.4 0-15l-32.3-11.9-11.9-32.3z"/></svg>'
              }
            ],
            {
              showIcons: true,
              truncateAfter: 3,
              animateChanges: true,
              schemaMarkup: true
            }
          );
          
          loadingBar.complete();
          pageManager.dependencies.scrollToTop();
        }, 200);
      }
    },

    loadArtistPage: (artistData) => {
      loadingBar.start();
      
      const dynamicContent = pageManager.dependencies.findElement(IDS.dynamicContent);
      if (!dynamicContent) return;

      dynamicContent.innerHTML = "";

      setTimeout(() => {
        pageManager.fragments.renderArtistPage(artistData);
        loadingBar.complete();
        pageManager.dependencies.scrollToTop();
      }, 300);
    },

    loadAllArtistsPage: () => {
      loadingBar.start();
      
      const dynamicContent = pageManager.dependencies.findElement(IDS.dynamicContent);
      if (!dynamicContent || !window.music) return;

      dynamicContent.innerHTML = "";

      setTimeout(() => {
        pageManager.fragments.renderAllArtistsPage();
        loadingBar.complete();
      }, 300);
    }
  }
  };





const homePage = {
  initialize: () => {
    appState.homePageManagerInstance = {
      renderHomePage: homePage.render,
    };
  },

  render: () => {
    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent) return;

    dynamicContent.innerHTML = "";

    dynamicContent.innerHTML = `
      
      <div class="bento-grid px-4 md:px-6 gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div class="bento-card col-span-full md:col-span-1">
          <div class="card-header">
            <h2 class="text-xl font-bold">Recently Played</h2>
            <a href="#" class="text-blue-400 hover:text-blue-300 text-sm" data-view="recent">View All</a>
          </div>
          <div id="${IDS.recentlyPlayedSection}" class="card-content">
            <div class="skeleton-loader"></div>
          </div>
        </div>
        
        <div class="bento-card col-span-full md:col-span-2">
          <div class="card-header">
            <h2 class="text-xl font-bold">Discover Albums</h2>
            <a href="#" class="text-blue-400 hover:text-blue-300 text-sm" data-view="albums">Explore More</a>
          </div>
          <div id="${IDS.randomAlbumsSection}" class="card-content">
            <div class="skeleton-loader"></div>
          </div>
        </div>
        
        <div class="bento-card col-span-full md:col-span-1">
          <div class="card-header">
            <h2 class="text-xl font-bold">Favorite Artists</h2>
            <a href="#" class="text-blue-400 hover:text-blue-300 text-sm" data-view="favorite-artists">View All</a>
          </div>
          <div id="${IDS.favoriteArtistsSection}" class="card-content">
            <div class="skeleton-loader"></div>
          </div>
        </div>
        
        <div class="bento-card col-span-full md:col-span-1">
          <div class="card-header">
            <h2 class="text-xl font-bold">Your Playlists</h2>
            <a href="#" class="text-blue-400 hover:text-blue-300 text-sm" data-view="playlists">View All</a>
          </div>
          <div id="${IDS.playlistsSection}" class="card-content">
            <div class="skeleton-loader"></div>
          </div>
        </div>
        
        <div class="bento-card col-span-full md:col-span-1">
          <div class="card-header">
            <h2 class="text-xl font-bold">Favorite Songs</h2>
            <a href="#" class="text-blue-400 hover:text-blue-300 text-sm" data-view="favorite-songs">View All</a>
          </div>
          <div id="${IDS.favoriteSongsSection}" class="card-content">
            <div class="skeleton-loader"></div>
          </div>
        </div>
      </div>
    `;

    homePage.addStyles();

    setTimeout(() => homePage.renderRecentlyPlayed(), 100);
    setTimeout(() => homePage.renderRandomAlbums(), 300);
    setTimeout(() => homePage.renderFavoriteArtists(), 500);
    setTimeout(() => homePage.renderPlaylists(), 700);
    setTimeout(() => homePage.renderFavoriteSongs(), 900);

    homePage.bindEvents();
  },

  addStyles: () => {
    if ($byId("bento-grid-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "bento-grid-styles";
    styleEl.textContent = `
      .bento-grid {
        display: grid;
        gap: 1.5rem;
      }
      
      .bento-card {
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .bento-card:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .card-content {
        min-height: 200px;
      }
      
      .skeleton-loader {
        height: 200px;
        background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 0.5rem;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .recent-tracks, .album-grid, .artist-grid, .playlists-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .recent-track, .playlist-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .recent-track:hover, .playlist-card:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }
      
      .track-art, .artist-avatar {
        width: 40px;
        height: 40px;
        border-radius: 0.25rem;
        object-fit: cover;
        flex-shrink: 0;
      }
      
      .artist-avatar {
        border-radius: 50%;
      }
      
      .track-info, .playlist-info {
        flex: 1;
        min-width: 0;
      }
      
      .track-title, .playlist-name {
        font-weight: 500;
        margin-bottom: 0.125rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-artist, .playlist-tracks {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-artist:hover {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: underline;
      }
      
      .album-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }
      
      .album-card {
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s ease;
        position: relative;
      }
      
      .album-cover {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 0.5rem;
        object-fit: cover;
        margin-bottom: 0.5rem;
        position: relative;
      }
      
      .album-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .album-card:hover .album-overlay {
        opacity: 1;
      }
      
      .album-play-btn {
        width: 3rem;
        height: 3rem;
        background: rgba(59, 130, 246, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .album-play-btn:hover {
        transform: scale(1.1);
        background: rgba(59, 130, 246, 1);
      }
      
      .album-play-btn svg {
        width: 1.2rem;
        height: 1.2rem;
      }
      
      .album-info {
        font-size: 0.875rem;
      }
      
      .album-title {
        font-weight: 500;
        margin-bottom: 0.125rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-artist {
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-artist:hover {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: underline;
      }
      
      .artist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
      }
      
      .artist-card {
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .artist-card:hover {
        transform: scale(1.05);
      }
      
      .artist-name {
        font-size: 0.875rem;
        font-weight: 500;
        margin-top: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .create-playlist-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background: rgba(59, 130, 246, 0.1);
        border: 1px dashed rgba(59, 130, 246, 0.3);
        color: rgb(59, 130, 246);
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        margin-top: 0.5rem;
        text-align: center;
        justify-content: center;
      }
      
      .create-playlist-btn:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.5);
        transform: translateY(-1px);
      }
      
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.875rem;
        text-align: center;
        padding: 2rem 1rem;
      }
      
      .empty-state svg {
        margin-bottom: 1rem;
        opacity: 0.6;
      }
      
      .play-button-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.2s ease;
        background: rgba(59, 130, 246, 0.9);
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      
      .recent-track:hover .play-button-overlay,
      .artist-card:hover .play-button-overlay {
        opacity: 1;
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleEl);
  },

  renderRecentlyPlayed: () => {
    const container = $byId(IDS.recentlyPlayedSection);
    if (!container) return;

    if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
      container.innerHTML = homePage.renderEmptyState("No recently played tracks", "music-note");
      return;
    }

    const recentTracks = appState.recentlyPlayed.slice(0, 5);

    let html = `<div class="recent-tracks animate-fade-in">`;

    recentTracks.forEach((track, index) => {
      html += `
        <div class="recent-track" data-song='${JSON.stringify(track).replace(/"/g, "&quot;")}' style="animation-delay: ${index * 100}ms;">
          <img src="${utils.getAlbumImageUrl(track.album)}" alt="${track.title}" class="track-art">
          <div class="track-info">
            <div class="track-title">${track.title}</div>
            <div class="track-artist" data-artist="${track.artist}">${track.artist}</div>
          </div>
          <div class="play-button-overlay">
            ${ICONS.play}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll(".recent-track").forEach((track) => {
      track.addEventListener("click", (e) => {
        if (e.target.closest(".track-artist")) return;

        try {
          const songData = JSON.parse(track.dataset.song);
          player.playSong(songData);
        } catch (error) {}
      });
    });

    container.querySelectorAll(".track-artist").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        if (appState.siteMapInstance) {
          appState.siteMapInstance.navigateTo(ROUTES.ARTIST, {
            artist: artistName,
          });
        }
      });
    });
  },

  renderRandomAlbums: () => {
    const container = $byId(IDS.randomAlbumsSection);
    if (!container) return;

    const albums = homePage.getRandomAlbums(6);

    if (!albums || albums.length === 0) {
      container.innerHTML = homePage.renderEmptyState("No albums found", "album");
      return;
    }

    let html = `<div class="album-grid animate-fade-in">`;

    albums.forEach((album, index) => {
      html += `
        <div class="album-card" style="animation-delay: ${index * 100}ms;" data-artist="${album.artist}" data-album="${album.album}">
          <div style="position: relative;">
            <img src="${utils.getAlbumImageUrl(album.album)}" alt="${album.album}" class="album-cover">
            <div class="album-overlay">
              <button class="album-play-btn" data-artist="${album.artist}" data-album="${album.album}">
                ${ICONS.play}
              </button>
            </div>
          </div>
          <div class="album-info">
            <div class="album-title">${album.album}</div>
            <div class="album-artist" data-artist="${album.artist}">${album.artist}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll(".album-play-btn").forEach((playBtn) => {
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = playBtn.dataset.artist;
        const albumName = playBtn.dataset.album;
        homePage.playAlbum(artistName, albumName);
      });
    });

    container.querySelectorAll(".album-card").forEach((albumCard) => {
      albumCard.addEventListener("click", (e) => {
        if (e.target.closest(".album-play-btn") || e.target.closest(".album-artist")) return;

        const artistName = albumCard.dataset.artist;
        const albumName = albumCard.dataset.album;
        homePage.playAlbum(artistName, albumName);
      });
    });

container.querySelectorAll(".album-artist").forEach((artistEl) => {
  artistEl.addEventListener("click", (e) => {
    e.stopPropagation();
    const artistName = artistEl.dataset.artist;
    const albumCard = artistEl.closest('.album-card');
    const albumName = albumCard ? albumCard.dataset.album : null;
    
    if (appState.siteMapInstance) {
      appState.siteMapInstance.navigateTo(ROUTES.ARTIST, {
        artist: artistName,
      });
      
      // Store the album to be loaded when artist page is ready
      if (albumName) {
        sessionStorage.setItem('pendingAlbumLoad', albumName);
        
        // Add a small delay to ensure artist page is loaded first
        setTimeout(() => {
          const storedAlbum = sessionStorage.getItem('pendingAlbumLoad');
          if (storedAlbum === albumName) {
            loadArtistInfo(artistName, albumName);
            sessionStorage.removeItem('pendingAlbumLoad');
          }
        }, 100);
      }
    }
  });
});
  },

  renderFavoriteArtists: () => {
    const container = $byId(IDS.favoriteArtistsSection);
    if (!container) return;

    if (!appState.favorites.artists || appState.favorites.artists.size === 0) {
      container.innerHTML = homePage.renderEmptyState("No favorite artists", "artist");
      return;
    }

    const artists = Array.from(appState.favorites.artists).slice(0, 6);

    let html = `<div class="artist-grid animate-fade-in">`;

    artists.forEach((artistName, index) => {
      const artistData = window.music?.find((a) => a.artist === artistName);
      if (!artistData) return;

      html += `
        <div class="artist-card" data-artist="${artistName}" style="animation-delay: ${index * 100}ms;">
          <div style="position: relative;">
            <img src="${utils.getArtistImageUrl(artistName)}" alt="${artistName}" class="artist-avatar">
            <div class="play-button-overlay">
              ${ICONS.play}
            </div>
          </div>
          <div class="artist-name">${artistName}</div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll(".artist-card").forEach((artistEl) => {
      artistEl.addEventListener("click", () => {
        const artistName = artistEl.dataset.artist;
        if (appState.siteMapInstance) {
          appState.siteMapInstance.navigateTo(ROUTES.ARTIST, {
            artist: artistName,
          });
        }
      });
    });
  },

  renderPlaylists: () => {
    const container = $byId(IDS.playlistsSection);
    if (!container) return;

    let html = "";

    if (!appState.playlists || appState.playlists.length === 0) {
      html = homePage.renderEmptyState("No playlists yet", "playlist");
    } else {
      html = `<div class="playlists-list animate-fade-in">`;

      const displayPlaylists = appState.playlists.slice(0, 3);

      displayPlaylists.forEach((playlist, index) => {
        html += `
          <div class="playlist-card" data-playlist-id="${playlist.id}" style="animation-delay: ${index * 100}ms;">
            <div class="playlist-icon" style="width: 40px; height: 40px; background: linear-gradient(45deg, #6366f1, #8b5cf6); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
              </svg>
            </div>
            <div class="playlist-info">
              <div class="playlist-name">${playlist.name}</div>
              <div class="playlist-tracks">${playlist.songs?.length || 0} track${playlist.songs?.length !== 1 ? "s" : ""}</div>
            </div>
            <div class="play-button-overlay">
              ${ICONS.play}
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }

    html += `
      <button class="create-playlist-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Create Playlist
      </button>
    `;

    container.innerHTML = html;

    container.querySelectorAll(".playlist-card").forEach((playlistEl) => {
      playlistEl.addEventListener("click", () => {
        const playlistId = playlistEl.dataset.playlistId;
        playlists.show(playlistId);
      });
    });

    const createBtn = container.querySelector(".create-playlist-btn");
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        const newPlaylist = playlists.create();
        if (newPlaylist) {
          setTimeout(() => homePage.renderPlaylists(), 100);
        }
      });
    }
  },

  renderFavoriteSongs: () => {
    const container = $byId(IDS.favoriteSongsSection);
    if (!container) return;

    if (!appState.favorites.songs || appState.favorites.songs.size === 0) {
      container.innerHTML = homePage.renderEmptyState("No favorite songs", "heart");
      return;
    }

    const songs = homePage.getSongsByIds(Array.from(appState.favorites.songs).slice(0, 5));

    let html = `<div class="recent-tracks animate-fade-in">`;

    songs.forEach((song, index) => {
      html += `
        <div class="recent-track" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}' style="animation-delay: ${index * 100}ms;">
          <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="track-art">
          <div class="track-info">
            <div class="track-title">${song.title}</div>
            <div class="track-artist" data-artist="${song.artist}">${song.artist}</div>
          </div>
          <div class="play-button-overlay">
            ${ICONS.play}
          </div>
          <button class="favorite-heart" data-song-id="${song.id}" style="position: absolute; top: 0.5rem; right: 0.5rem; color: #ef4444; opacity: 0.8; background: none; border: none; cursor: pointer;">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll(".recent-track").forEach((track) => {
      track.addEventListener("click", (e) => {
        if (e.target.closest(".track-artist") || e.target.closest(".favorite-heart")) return;

        try {
          const songData = JSON.parse(track.dataset.song);
          player.playSong(songData);
        } catch (error) {}
      });
    });

    container.querySelectorAll(".track-artist").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        if (appState.siteMapInstance) {
          appState.siteMapInstance.navigateTo(ROUTES.ARTIST, {
            artist: artistName,
          });
        }
      });
    });

    container.querySelectorAll(".favorite-heart").forEach((heartBtn) => {
      heartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const songId = heartBtn.dataset.songId;
        appState.favorites.remove("songs", songId);

        const track = heartBtn.closest(".recent-track");
        track.style.transition = "all 0.3s ease";
        track.style.opacity = "0";
        track.style.transform = "translateX(-20px)";

        setTimeout(() => {
          track.remove();
          const remaining = container.querySelectorAll(".recent-track");
          if (remaining.length === 0) {
            homePage.renderFavoriteSongs();
          }
        }, 300);
      });
    });
  },

  bindEvents: () => {
    document.querySelectorAll("[data-view]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = link.dataset.view;

        switch (view) {
          case "recent":
            musicPlayer.open();
            setTimeout(() => musicPlayer.switchTab("recent"), 50);
            break;
          case "albums":
            notifications.show("Albums view coming soon");
            break;
          case "favorite-artists":
            views.showFavoriteArtists();
            break;
          case "playlists":
            playlists.showAll();
            break;
          case "favorite-songs":
            views.showFavoriteSongs();
            break;
          default:
            notifications.show("View coming soon");
        }
      });
    });
  },

  getRandomAlbums: (count = 6) => {
    if (!window.music) return [];

    const allAlbums = [];
    window.music.forEach((artist) => {
      artist.albums.forEach((album) => {
        allAlbums.push({
          artist: artist.artist,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album),
          songs: album.songs,
        });
      });
    });

    const shuffled = [...allAlbums].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  getSongsByIds: (ids) => {
    if (!window.music || !ids.length) return [];

    const songs = [];

    window.music.forEach((artist) => {
      artist.albums.forEach((album) => {
        album.songs.forEach((song) => {
          if (ids.includes(song.id)) {
            songs.push({
              ...song,
              artist: artist.artist,
              album: album.album,
              cover: utils.getAlbumImageUrl(album.album),
            });
          }
        });
      });
    });

    return songs;
  },

  playAlbum: (artistName, albumName) => {
    if (!window.music) return;

    const artist = window.music.find((a) => a.artist === artistName);
    if (!artist) return;

    const album = artist.albums.find((a) => a.album === albumName);
    if (!album || album.songs.length === 0) return;

    appState.queue.clear();

    album.songs.slice(1).forEach((song) => {
      appState.queue.add({
        ...song,
        artist: artistName,
        album: albumName,
        cover: utils.getAlbumImageUrl(albumName),
      });
    });

    player.playSong({
      ...album.songs[0],
      artist: artistName,
      album: albumName,
      cover: utils.getAlbumImageUrl(albumName),
    });

    notifications.show(`Playing album "${albumName}"`, NOTIFICATION_TYPES.SUCCESS);
  },

  renderEmptyState: (message, iconType) => {
    const icons = {
      "music-note": '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>',
      album: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>',
      artist: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
      playlist: '<path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>',
      heart: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    };

    return `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-3 opacity-50">
          ${icons[iconType] || icons["music-note"]}
        </svg>
        <p>${message}</p>
      </div>
    `;
  },
};

const storage = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  },
  load: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  initialize: () => {
    const favoriteTypes = [
      {
        type: "songs",
        key: STORAGE_KEYS.FAVORITE_SONGS,
      },
      {
        type: "artists",
        key: STORAGE_KEYS.FAVORITE_ARTISTS,
      },
      {
        type: "albums",
        key: STORAGE_KEYS.FAVORITE_ALBUMS,
      },
    ];

    favoriteTypes.forEach(({ type, key }) => {
      const data = storage.load(key);
      if (data) {
        appState.favorites[type] = new Set(data);
      }
    });

    const dataLoaders = {
      [STORAGE_KEYS.RECENTLY_PLAYED]: (data) => (appState.recentlyPlayed = data || []),
      [STORAGE_KEYS.PLAYLISTS]: (data) => (appState.playlists = data || []),
      [STORAGE_KEYS.QUEUE]: (data) => (appState.queue.items = data || []),
    };

    Object.entries(dataLoaders).forEach(([key, loader]) => {
      const data = storage.load(key);
      if (data) loader(data);
    });
  },
};

const mediaSession = {
  setup: () => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = null;

    const actions = {
      play: () => controls.play(),
      pause: () => controls.pause(),
      previoustrack: () => controls.previous(),
      nexttrack: () => controls.next(),
      seekto: (details) => controls.seekTo(details.seekTime),
      seekbackward: (details) => controls.skip(-(details.seekOffset || 10)),
      seekforward: (details) => controls.skip(details.seekOffset || 10),
    };

    Object.entries(actions).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {}
    });
  },
  updateMetadata: (songData) => {
    if (!("mediaSession" in navigator) || !songData) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songData.title || "Unknown Song",
        artist: songData.artist || "Unknown Artist",
        album: songData.album || "Unknown Album",
        artwork: [
          {
            src: songData.artwork || utils.getAlbumImageUrl(songData.album),
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });
    } catch (error) {}
  },

  updatePlaybackState: (playing) => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.playbackState = playing ? "playing" : "paused";

    try {
      if (appState.audio && appState.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: appState.duration,
          playbackRate: 1.0,
          position: appState.audio.currentTime || 0,
        });
      }
    } catch (error) {}
  },
};

const player = {
  isScrubbing: false,
  wasPlayingBeforeScrub: false,
  rafId: null,

  initialize: () => {
    if (appState.audio) return;
    appState.audio = new Audio();
    const events = {
      timeupdate: player.updateProgress,
      ended: player.onEnded,
      loadedmetadata: player.onMetadataLoaded,
      play: player.onPlay,
      pause: player.onPause,
      error: player.onError,
    };
    Object.entries(events).forEach(([event, handler]) => appState.audio.addEventListener(event, handler));
    player.bindSeekBar();
    mediaSession.setup();
  },

  bindSeekBar: () => {
    const bar = $byId(IDS.progressBar);
    const thumb = $byId(IDS.progressThumb);
    if (!bar || !thumb) return;

    const onPointerDown = (e) => {
      e.preventDefault();
      bar.setPointerCapture?.(e.pointerId ?? 1);
      player.isScrubbing = true;
      player.wasPlayingBeforeScrub = !!appState.isPlaying;
      if (player.wasPlayingBeforeScrub) appState.audio.pause();
      player.seekFromEvent(e, bar);
      bar.classList.add('is-dragging');
      const moveTarget = bar;
      moveTarget.addEventListener('pointermove', onPointerMove, { passive: false });
      moveTarget.addEventListener('pointerup', onPointerUp, { once: true });
      window.addEventListener('pointercancel', onPointerUp, { once: true });
    };

    const onPointerMove = (e) => {
      if (!player.isScrubbing) return;
      e.preventDefault();
      player.seekFromEvent(e, bar);
    };

    const onPointerUp = (e) => {
      player.seekFromEvent(e, bar, true);
      player.isScrubbing = false;
      bar.classList.remove('is-dragging', 'is-hovering');
      if (player.wasPlayingBeforeScrub) appState.audio.play();
      bar.releasePointerCapture?.(e.pointerId ?? 1);
      bar.removeEventListener('pointermove', onPointerMove);
    };

    const onEnter = () => bar.classList.add('is-hovering');
    const onLeave = () => { if (!player.isScrubbing) bar.classList.remove('is-hovering'); };

    bar.addEventListener('pointerdown', onPointerDown, { passive: false });
    bar.addEventListener('pointerenter', onEnter);
    bar.addEventListener('pointerleave', onLeave);
  },

  seekFromEvent: (e, bar, finalize = false) => {
    const rect = bar.getBoundingClientRect();
    const x = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    let pct = ((x - rect.left) / rect.width) * 100;
    if (!isFinite(pct)) pct = 0;
    pct = Math.max(0, Math.min(100, pct));
    const time = (appState.duration || appState.audio?.duration || 0) * (pct / 100);
    player.setProgressUI(pct, time);
    if (finalize) {
      if (isFinite(time)) appState.audio.currentTime = time;
    }
  },

  setProgressUI: (percent, currentTime) => {
    const fill = $byId(IDS.progressFill);
    const thumb = $byId(IDS.progressThumb);
    const currentTimeElement = $byId(IDS.currentTime);
    if (fill) fill.style.width = percent + '%';
    if (thumb) thumb.style.left = percent + '%';
    if (currentTimeElement && isFinite(currentTime)) currentTimeElement.textContent = utils.formatTime(currentTime);
  },

  loadAudioFile: async (songData) => {
    for (const format of AUDIO_FORMATS) {
      try {
        const songFileName = songData.title.toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "");
        const audioUrl = `https://koders.cloud/global/content/audio/${songFileName}.${format}`;
        appState.audio.src = audioUrl;
        await new Promise((resolve, reject) => {
          const loadHandler = () => { appState.audio.removeEventListener("canplaythrough", loadHandler); appState.audio.removeEventListener("error", errorHandler); resolve(); };
          const errorHandler = (e) => { appState.audio.removeEventListener("canplaythrough", loadHandler); appState.audio.removeEventListener("error", errorHandler); reject(e); };
          appState.audio.addEventListener("canplaythrough", loadHandler, { once: true });
          appState.audio.addEventListener("error", errorHandler, { once: true });
          if (appState.audio.readyState >= 3) loadHandler();
        });
        await appState.audio.play();
        return true;
      } catch (error) {}
    }
    return false;
  },

  playSong: async (songData) => {
    if (!songData) return;
    player.initialize();
    ui.setLoadingState(true);
    if (appState.currentSong) player.addToRecentlyPlayed(appState.currentSong);
    appState.currentSong = songData;
    appState.currentArtist = songData.artist;
    appState.currentAlbum = songData.album;
    ui.updateNowPlaying();
    ui.updateNavbar();
    ui.updateMusicPlayer();
    ui.updateCounts();
    mediaSession.updateMetadata(songData);
    const success = await player.loadAudioFile(songData);
    if (success) {
      setTimeout(() => { eventHandlers.bindControlEvents?.(); player.bindSeekBar(); }, 100);
    } else {
      appState.isPlaying = false;
      ui.updatePlayPauseButtons();
      mediaSession.updatePlaybackState(false);
    }
    ui.setLoadingState(false);
  },

  toggle: () => { if (appState.isPlaying) controls.pause(); else controls.play(); },

  onPlay: () => { appState.isPlaying = true; ui.updatePlayPauseButtons(); mediaSession.updatePlaybackState(true); },
  onPause: () => { appState.isPlaying = false; ui.updatePlayPauseButtons(); mediaSession.updatePlaybackState(false); },

  onMetadataLoaded: () => {
    if (!appState.audio || isNaN(appState.audio.duration)) return;
    appState.duration = appState.audio.duration;
    const totalTimeElement = $byId(IDS.totalTime);
    if (totalTimeElement) totalTimeElement.textContent = utils.formatTime(appState.duration);
    player.updateProgress();
  },

  onError: (error) => {},

  onEnded: () => {
    if (appState.repeatMode === REPEAT_MODES.ONE) { appState.audio.currentTime = 0; appState.audio.play(); return; }
    controls.next();
  },

  updateProgress: () => {
    if (!appState.audio) return;
    if (player.isScrubbing) return;
    const duration = appState.duration || appState.audio.duration || 0;
    const currentTime = appState.audio.currentTime || 0;
    const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
    player.setProgressUI(percent, currentTime);
    mediaSession.updatePlaybackState(appState.isPlaying);
  },

  addToRecentlyPlayed: (song) => {
    appState.recentlyPlayed.unshift(song);
    if (appState.recentlyPlayed.length > 50) appState.recentlyPlayed = appState.recentlyPlayed.slice(0, 50);
    storage.save(STORAGE_KEYS.RECENTLY_PLAYED, appState.recentlyPlayed.slice(0, 20));
  },

  getNextInAlbum: () => {
    if (!appState.currentSong || !window.music) return null;
    const artist = window.music.find((a) => a.artist === appState.currentArtist);
    const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
    if (!album) return null;
    const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
    const nextIndex = appState.shuffleMode ? Math.floor(Math.random() * album.songs.length) : (currentIndex + 1) % album.songs.length;
    if (nextIndex !== currentIndex || appState.repeatMode === REPEAT_MODES.ALL) {
      return { ...album.songs[nextIndex], artist: artist.artist, album: album.album, cover: utils.getAlbumImageUrl(album.album) };
    }
    return null;
  },

  getPreviousInAlbum: () => {
    if (!appState.currentSong || !window.music) return null;
    const artist = window.music.find((a) => a.artist === appState.currentArtist);
    const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
    if (!album) return null;
    const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
    const prevIndex = (currentIndex - 1 + album.songs.length) % album.songs.length;
    return { ...album.songs[prevIndex], artist: artist.artist, album: album.album, cover: utils.getAlbumImageUrl(album.album) };
  },
};

const controls = {
  play: () => {
    if (!appState.currentSong || !appState.audio) return;
    appState.audio.play().catch((err) => {
    });
  },
  pause: () => {
    if (!appState.audio) return;
    appState.audio.pause();
  },
  next: () => {
    const nextSong = appState.queue.getNext();
    if (nextSong) {
      player.playSong(nextSong);
      return;
    }

    const nextInAlbum = player.getNextInAlbum();
    if (nextInAlbum) {
      player.playSong(nextInAlbum);
    }
  },
  previous: () => {
    if (appState.audio && appState.audio.currentTime > 3) {
      appState.audio.currentTime = 0;
      return;
    }

    if (appState.recentlyPlayed.length > 0) {
      const prevSong = appState.recentlyPlayed.shift();
      player.playSong(prevSong);
      return;
    }

    const prevInAlbum = player.getPreviousInAlbum();
    if (prevInAlbum) {
      player.playSong(prevInAlbum);
    }
  },
  seekTo: (time) => {
    if (!appState.audio || isNaN(time) || time < 0) return;
    if (!isFinite(time)) return;

    const safeTime = Math.max(0, Math.min(appState.duration || 0, time));
    appState.audio.currentTime = safeTime;
    player.updateProgress();
  },
  skip: (seconds) => {
    if (!appState.audio) return;
    const newTime = appState.audio.currentTime + seconds;
    controls.seekTo(newTime);
  },

  shuffle: {
    toggle: () => {
      appState.shuffleMode = !appState.shuffleMode;
      ui.updateShuffleButton();
      notifications.show(`Shuffle ${appState.shuffleMode ? "enabled" : "disabled"}`);
    },

    all: () => {
      if (!window.music || window.music.length === 0) {
        notifications.show("No music library found", NOTIFICATION_TYPES.WARNING);
        return;
      }

      const allSongs = [];
      window.music.forEach((artist) => {
        artist.albums.forEach((album) => {
          album.songs.forEach((song) => {
            allSongs.push({
              ...song,
              artist: artist.artist,
              album: album.album,
              cover: utils.getAlbumImageUrl(album.album),
            });
          });
        });
      });

      if (allSongs.length === 0) {
        notifications.show("No songs found", NOTIFICATION_TYPES.WARNING);
        return;
      }

      for (let i = allSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
      }

      appState.queue.clear();
      allSongs.slice(1).forEach((song) => appState.queue.add(song));
      player.playSong(allSongs[0]);
      appState.shuffleMode = true;
      ui.updateShuffleButton();
      notifications.show("Playing all songs shuffled");
    },
  },

  repeat: {
    toggle: () => {
      if (appState.repeatMode === REPEAT_MODES.OFF) {
        appState.repeatMode = REPEAT_MODES.ALL;
      } else if (appState.repeatMode === REPEAT_MODES.ALL) {
        appState.repeatMode = REPEAT_MODES.ONE;
      } else {
        appState.repeatMode = REPEAT_MODES.OFF;
      }

      ui.updateRepeatButton();

      const modeText = appState.repeatMode === REPEAT_MODES.OFF ? "disabled" : appState.repeatMode === REPEAT_MODES.ALL ? "all songs" : "current song";
      notifications.show(`Repeat ${modeText}`);
    },
  },
};

const ui = {
  setLoadingState: (loading) => {
    const nowPlayingArea = $bySelector(NAVBAR.nowPlaying);
    const songTitle = $bySelector(NAVBAR.songName);

    if (nowPlayingArea) nowPlayingArea.style.opacity = loading ? "0.5" : "1";
    if (songTitle) songTitle.textContent = loading ? "Loading..." : appState.currentSong?.title || "";
  },

  updateNowPlaying: () => {
    if (!appState.currentSong) return;

    const elements = {
      albumCover: $bySelector(MUSIC_PLAYER.albumArtwork),
      songTitle: $bySelector(MUSIC_PLAYER.songName),
      artistName: $bySelector(MUSIC_PLAYER.artistName),
      albumName: $bySelector(MUSIC_PLAYER.albumName),
    };

    if (elements.albumCover) {
      utils.loadImageWithFallback(elements.albumCover, utils.getAlbumImageUrl(appState.currentSong.album), utils.getDefaultAlbumImage(), "album");
    }

    if (elements.songTitle) elements.songTitle.textContent = appState.currentSong.title;
    if (elements.artistName) elements.artistName.textContent = appState.currentSong.artist;
    if (elements.albumName) elements.albumName.textContent = appState.currentSong.album;

    ui.updatePlayPauseButtons();
    ui.updateFavoriteButton();
  },

  updateNavbar: () => {
    if (!appState.currentSong) return;

    const container = $bySelector(NAVBAR.albumArtwork);
    const artist = $bySelector(NAVBAR.artistName);
    const songTitle = $bySelector(NAVBAR.songName);
    const playIndicator = $bySelector(NAVBAR.playIndicator);
    const nowPlayingArea = $bySelector(NAVBAR.nowPlaying);

    if (container) {
      const svg = container.querySelector("svg");
      const img = container.querySelector("img");

      if (img) {
        const albumUrl = utils.getAlbumImageUrl(appState.currentSong.album);
        utils.loadImageWithFallback(img, albumUrl, utils.getDefaultAlbumImage(), "album");
        img.classList.remove("opacity-0");
        img.classList.add("opacity-100");
      }

      if (svg) {
        svg.classList.add(CLASSES.hidden);
      }
    }

    if (artist) artist.textContent = appState.currentSong.artist;

    if (songTitle) {
      const title = appState.currentSong.title;
      songTitle.classList.toggle(CLASSES.marquee, title.length > 25);
      songTitle.textContent = title;
    }

    if (playIndicator) {
      playIndicator.classList.toggle(CLASSES.active, appState.isPlaying);
    }

    if (nowPlayingArea) {
      nowPlayingArea.classList.add(CLASSES.hasSong);
    }
  },

  updatePlayPauseButtons: () => {
    const navBarPlay = $byId(IDS.playIconNavbar);
    const navBarPause = $byId(IDS.pauseIconNavbar);
    
    if (navBarPlay && navBarPause) {
      navBarPlay.style.display = appState.isPlaying ? "none" : "block";
      navBarPause.style.display = appState.isPlaying ? "block" : "none";
    }

    const musicPlayerBtn = $byId(IDS.playBtn);
    if (musicPlayerBtn) {
      const playIcon = musicPlayerBtn.querySelector(".icon.play");
      const pauseIcon = musicPlayerBtn.querySelector(".icon.pause");
      if (playIcon && pauseIcon) {
        playIcon.classList.toggle(CLASSES.hidden, appState.isPlaying);
        pauseIcon.classList.toggle(CLASSES.hidden, !appState.isPlaying);
      }
      musicPlayerBtn.classList.toggle(CLASSES.playing, appState.isPlaying);
    }
  },

  updateShuffleButton: () => {
    const shuffleBtn = $byId(IDS.shuffleBtn);
    if (shuffleBtn) {
      shuffleBtn.classList.toggle(CLASSES.active, appState.shuffleMode);
    }
  },

  updateRepeatButton: () => {
    const repeatBtn = $byId(IDS.repeatBtn);
    if (repeatBtn) {
      repeatBtn.classList.toggle(CLASSES.active, appState.repeatMode !== REPEAT_MODES.OFF);
      repeatBtn.classList.toggle(CLASSES.repeatOne, appState.repeatMode === REPEAT_MODES.ONE);
    }
  },

updateFavoriteButton: () => {
  if (!appState.currentSong) return;
  const favoriteBtn = $byId(IDS.favoriteBtn);
  if (favoriteBtn) {
    const isFavorite = appState.favorites.has("songs", appState.currentSong.id);
    favoriteBtn.classList.toggle("favorited", isFavorite);
    favoriteBtn.classList.toggle(CLASSES.active, isFavorite);
    favoriteBtn.setAttribute("data-favorite-songs", appState.currentSong.id);
    const heartIcon = favoriteBtn.querySelector("svg");
    if (heartIcon) {
      heartIcon.style.color = isFavorite ? "#ef4444" : "";
      heartIcon.style.fill = isFavorite ? "currentColor" : "none";
    }
  }
},

  updateCounts: () => {
    const counts = {
      [IDS.favoriteSongsCount]: appState.favorites.songs.size,
      [IDS.favoriteArtistsCount]: appState.favorites.artists.size,
      [IDS.recentCount]: appState.recentlyPlayed.length,
      [IDS.queueCount]: appState.queue.items.length,
    };

    Object.entries(counts).forEach(([id, value]) => {
      const element = $byId(id);
      if (element) element.textContent = value;
    });
  },

  updateMusicPlayer: () => {
    ui.updateNowPlaying();
    ui.updateShuffleButton();
    ui.updateRepeatButton();
  },
};

const dropdown = {
  toggle: (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const menu = $byId(IDS.dropdownMenu);
    const trigger = $byId(IDS.menuTrigger);

    if (!menu || !trigger) return;

    const isVisible = menu.classList.contains(CLASSES.show);

    if (isVisible) {
      dropdown.close();
    } else {
      dropdown.open();
    }
  },

  open: (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const menu = $byId(IDS.dropdownMenu);
    const trigger = $byId(IDS.menuTrigger);

    if (!menu || !trigger) return;

    ui.updateCounts();
    menu.classList.add(CLASSES.show);
    trigger.classList.add(CLASSES.active);
    musicPlayer.close();
  },

  close: (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const menu = $byId(IDS.dropdownMenu);
    const trigger = $byId(IDS.menuTrigger);

    if (!menu || !trigger) return;

    menu.classList.remove(CLASSES.show);
    trigger.classList.remove(CLASSES.active);
  },
};

const playlists = {
    add: (name) => {
        if (!name || !name.trim()) {
            notifications.show("Please enter a playlist name", NOTIFICATION_TYPES.WARNING);
            return null;
        }

        const playlist = {
            id: Date.now().toString(),
            name: name.trim(),
            songs: [],
            created: new Date().toISOString(),
            description: "",
            cover: null,
        };

        appState.playlists.push(playlist);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);

        if (typeof homePage?.renderPlaylists === "function") {
            homePage.renderPlaylists();
        }

        notifications.show(`Created playlist "${playlist.name}"`, NOTIFICATION_TYPES.SUCCESS);
        return playlist;
    },

    addSong: (playlistId, song) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) {
            notifications.show("Playlist not found", NOTIFICATION_TYPES.ERROR);
            return false;
        }

        const exists = playlist.songs.some((s) => s.id === song.id);
        if (exists) {
            notifications.show("Song already in playlist", NOTIFICATION_TYPES.WARNING);
            return false;
        }

        playlist.songs.push(song);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);

        notifications.show(`Added "${song.title}" to "${playlist.name}"`, NOTIFICATION_TYPES.SUCCESS);
        return true;
    },

    removeSong: (playlistId, songId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) return false;

        const initialLength = playlist.songs.length;
        playlist.songs = playlist.songs.filter((s) => s.id !== songId);

        if (playlist.songs.length < initialLength) {
            storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
            notifications.show("Song removed from playlist", NOTIFICATION_TYPES.INFO);
            return true;
        }

        return false;
    },

    play: (playlistId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist || playlist.songs.length === 0) {
            notifications.show("Playlist is empty", NOTIFICATION_TYPES.WARNING);
            return;
        }

        appState.queue.clear();
        playlist.songs.slice(1).forEach((song) => appState.queue.add(song));
        player.playSong(playlist.songs[0]);

        notifications.show(`Playing playlist "${playlist.name}"`, NOTIFICATION_TYPES.SUCCESS);
    },

    remove: async (playlistId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) return false;
        
        const confirmed = await overlays.dialog.confirm(
            `Delete the playlist "${playlist.name}"? This cannot be undone.`, 
            {
                okText: "Delete",
                danger: true,
            }
        );
        
        if (!confirmed) return false;
        
        const playlistName = playlist.name;
        appState.playlists = appState.playlists.filter((p) => p.id !== playlistId);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
        notifications.show(`Deleted playlist "${playlistName}"`, NOTIFICATION_TYPES.INFO);
        
        return true;
    },

    create: async () => {
        const name = await overlays.form.prompt(
            "Enter playlist name:", 
            {
                okText: "Create",
                placeholder: "My playlist",
            }
        );
        
        if (name) return playlists.add(name);
        return null;
    },

    showAll: () => {
        if (appState.playlists.length === 0) {
            overlays.viewer.playlists(
                views.renderEmptyState(
                    "No Playlists", 
                    "You haven't created any playlists yet.", 
                    "Create your first playlist to organize your music."
                )
            );
            return;
        }

        const content = `
            <div class="playlists-page animate__animated animate__fadeIn">
              <div class="page-header mb-8 flex justify-between items-center">
                <div>
                  <h1 class="text-3xl font-bold mb-2">Your Playlists</h1>
                  <p class="text-gray-400">${appState.playlists.length} playlist${appState.playlists.length !== 1 ? "s" : ""}</p>
                </div>
                <button class="create-playlist-btn bg-accent-primary text-white px-6 py-3 rounded-full hover:bg-accent-secondary transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Create Playlist
                </button>
              </div>

              <div class="playlists-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${appState.playlists
                  .map(
                    (playlist, index) => `
                  <div class="playlist-card bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer" style="animation-delay: ${index * 100}ms;" data-playlist-id="${playlist.id}">
                    <div class="playlist-cover aspect-square bg-gradient-to-br from-purple-500 to-blue-600 relative">
                      <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-16 h-16">
                          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                        </svg>
                      </div>
                      <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="play-playlist-btn w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform" data-playlist-id="${playlist.id}">
                          ${ICONS.play}
                        </button>
                      </div>
                    </div>
                    <div class="p-4">
                      <h3 class="font-bold text-lg mb-1 truncate">${playlist.name}</h3>
                      <p class="text-gray-400 text-sm mb-3">${playlist.songs.length} song${playlist.songs.length !== 1 ? "s" : ""}</p>
                      <div class="flex gap-2">
                        <button class="view-playlist-btn flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-500 transition-colors text-sm" data-playlist-id="${playlist.id}">
                          View
                        </button>
                        <button class="delete-playlist-btn px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" data-playlist-id="${playlist.id}">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `;

        overlays.viewer.playlists(content);
        const modalEl = document.getElementById("playlist-viewer");
        playlists.bindEvents(modalEl);
    },

    show: (playlistId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) {
            notifications.show("Playlist not found", NOTIFICATION_TYPES.ERROR);
            return;
        }

        views.showLoading();

        setTimeout(() => {
            const dynamicContent = $byId(IDS.dynamicContent);
            if (!dynamicContent) return;

            dynamicContent.innerHTML = `
                <div class="playlist-page animate__animated animate__fadeIn">
                  <div class="playlist-header mb-8 flex items-start gap-6">
                    <div class="playlist-cover w-48 h-48 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-24 h-24">
                        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                      </svg>
                    </div>
                    <div class="playlist-info flex-1">
                      <p class="text-sm text-gray-400 mb-2">PLAYLIST</p>
                      <h1 class="text-4xl font-bold mb-4">${playlist.name}</h1>
                      <p class="text-gray-400 mb-6">${playlist.songs.length} song${playlist.songs.length !== 1 ? "s" : ""} • Created ${new Date(playlist.created).toLocaleDateString()}</p>
                      <div class="flex gap-4">
                        <button class="play-playlist-btn bg-accent-primary text-white px-8 py-3 rounded-full hover:bg-accent-secondary transition-colors flex items-center gap-2" data-playlist-id="${playlist.id}" ${
            playlist.songs.length === 0 ? "disabled" : ""
          }>
                          ${ICONS.play}
                          Play
                        </button>
                        <button class="edit-playlist-btn bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-500 transition-colors" data-playlist-id="${playlist.id}">
                          Edit
                        </button>
                        <button class="delete-playlist-btn bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors" data-playlist-id="${playlist.id}">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  ${
                    playlist.songs.length === 0
                      ? `
                    <div class="empty-playlist text-center py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 mx-auto mb-4 text-gray-600">
                        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                      </svg>
                      <h3 class="text-xl font-bold mb-2">This playlist is empty</h3>
                      <p class="text-gray-400 mb-4">Add songs to start building your playlist</p>
                      <button class="browse-music-btn bg-accent-primary text-white px-6 py-2 rounded-full hover:bg-accent-secondary transition-colors">
                        Browse Music
                      </button>
                    </div>
                  `
                      : `
                    <div class="songs-list">
                      <div class="songs-header grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-700 mb-2">
                        <div class="col-span-1">#</div>
                        <div class="col-span-5">Title</div>
                        <div class="col-span-3 hidden md:block">Album</div>
                        <div class="col-span-2 hidden md:block">Date Added</div>
                        <div class="col-span-1">Duration</div>
                      </div>
                      ${playlist.songs
                        .map(
                          (song, index) => `
                        <div class="song-row grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}' data-playlist-id="${
                            playlist.id
                          }" data-song-index="${index}">
                          <div class="col-span-1 text-gray-400 group-hover:hidden">${index + 1}</div>
                          <div class="col-span-1 hidden group-hover:block">
                            <button class="play-song-btn w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                              ${ICONS.play}
                            </button>
                          </div>
                          <div class="col-span-5 flex items-center gap-3">
                            <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="w-10 h-10 rounded object-cover">
                            <div>
                              <div class="font-medium">${song.title}</div>
                              <div class="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors" data-artist="${song.artist}">${song.artist}</div>
                            </div>
                          </div>
                          <div class="col-span-3 hidden md:block text-gray-400 text-sm">${song.album}</div>
                          <div class="col-span-2 hidden md:block text-gray-400 text-sm">${new Date().toLocaleDateString()}</div>
                          <div class="col-span-1 flex items-center justify-between">
                            <span class="text-gray-400 text-sm">${song.duration || "0:00"}</span>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <button class="action-btn p-1 hover:bg-white/10 rounded transition-colors" data-action="favorite" data-song-id="${song.id}" title="Add to favorites">
                                <svg class="w-4 h-4 ${appState.favorites.has("songs", song.id) ? "text-red-500" : ""}" fill="${appState.favorites.has("songs", song.id) ? "currentColor" : "none"}" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                              </button>
                              <button class="action-btn p-1 hover:bg-white/10 rounded transition-colors" data-action="add-queue" title="Add to queue">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                              </button>
                              <button class="action-btn p-1 hover:bg-white/10 rounded transition-colors" data-action="remove-from-playlist" title="Remove from playlist">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  `
                  }
                </div>
              `;

            playlists.bindViewEvents(playlist);
        }, 450);
    },

    bindEvents: (root = $byId(IDS.dynamicContent)) => {
        const dynamicContent = root;
        if (!dynamicContent) return;

        const createBtn = dynamicContent.querySelector(".create-playlist-btn");
        if (createBtn) {
            createBtn.addEventListener("click", async () => {
                const newPlaylist = await playlists.create();
                if (newPlaylist) {
                    setTimeout(() => playlists.showAll(), 100);
                }
            });
        }

        dynamicContent.querySelectorAll(".view-playlist-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const playlistId = btn.dataset.playlistId;
                playlists.show(playlistId);
            });
        });

        dynamicContent.querySelectorAll(".play-playlist-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const playlistId = btn.dataset.playlistId;
                playlists.play(playlistId);
            });
        });

        dynamicContent.querySelectorAll(".delete-playlist-btn").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const playlistId = btn.dataset.playlistId;
                if (await playlists.remove(playlistId)) {
                    setTimeout(() => playlists.showAll(), 100);
                }
            });
        });

        dynamicContent.querySelectorAll(".playlist-card").forEach((card) => {
            card.addEventListener("click", () => {
                const playlistId = card.dataset.playlistId;
                playlists.show(playlistId);
            });
        });
    },

    bindViewEvents: (playlist) => {
        const dynamicContent = $byId(IDS.dynamicContent);
        if (!dynamicContent) return;

        const playBtn = dynamicContent.querySelector(".play-playlist-btn");
        if (playBtn) {
            playBtn.addEventListener("click", () => {
                playlists.play(playlist.id);
            });
        }

        const editBtn = dynamicContent.querySelector(".edit-playlist-btn");
        if (editBtn) {
            editBtn.addEventListener("click", async () => {
                const newName = await overlays.form.prompt(
                    "Enter new playlist name:",
                    {
                        okText: "Rename",
                        placeholder: "Playlist name",
                        value: playlist.name
                    }
                );
                
                if (newName && newName.trim() && newName.trim() !== playlist.name) {
                    playlist.name = newName.trim();
                    storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
                    playlists.show(playlist.id);
                    notifications.show("Playlist renamed successfully", NOTIFICATION_TYPES.SUCCESS);
                }
            });
        }

        const deleteBtn = dynamicContent.querySelector(".delete-playlist-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                if (await playlists.remove(playlist.id)) {
                    if (appState.siteMapInstance) {
                        appState.siteMapInstance.navigateTo(ROUTES.HOME);
                    }
                }
            });
        }

        const browseBtn = dynamicContent.querySelector(".browse-music-btn");
        if (browseBtn) {
            browseBtn.addEventListener("click", () => {
                if (appState.siteMapInstance) {
                    appState.siteMapInstance.navigateTo(ROUTES.HOME);
                }
            });
        }

        dynamicContent.querySelectorAll(".song-row").forEach((row) => {
            row.addEventListener("click", (e) => {
                if (e.target.closest(".action-btn") || e.target.closest(".play-song-btn")) return;

                try {
                    const songData = JSON.parse(row.dataset.song);
                    player.playSong(songData);
                } catch (error) {}
            });
        });

        dynamicContent.querySelectorAll(".play-song-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const songRow = btn.closest(".song-row");
                try {
                    const songData = JSON.parse(songRow.dataset.song);
                    player.playSong(songData);
                } catch (error) {}
            });
        });

        dynamicContent.querySelectorAll("[data-artist]").forEach((artistEl) => {
            artistEl.addEventListener("click", (e) => {
                e.stopPropagation();
                const artistName = artistEl.dataset.artist;
                if (appState.siteMapInstance) {
                    appState.siteMapInstance.navigateTo(ROUTES.ARTIST, {
                        artist: artistName,
                    });
                }
            });
        });

        dynamicContent.querySelectorAll(".action-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const songRow = btn.closest(".song-row");
                const songData = JSON.parse(songRow.dataset.song);

                switch (action) {
                    case "favorite":
                        appState.favorites.toggle("songs", songData.id);
                        const heartIcon = btn.querySelector("svg");
                        const isFavorite = appState.favorites.has("songs", songData.id);
                        heartIcon.style.color = isFavorite ? "#ef4444" : "";
                        heartIcon.style.fill = isFavorite ? "currentColor" : "none";
                        break;
                    case "add-queue":
                        appState.queue.add(songData);
                        break;
                    case "remove-from-playlist":
                        const playlistId = songRow.dataset.playlistId;
                        const songIndex = parseInt(songRow.dataset.songIndex);
                        if (playlists.removeSong(playlistId, songData.id)) {
                            playlists.show(playlistId);
                        }
                        break;
                }
            });
        });
    },
};

const views = {
    showFavoriteSongs: () => {
        const favoriteSongIds = Array.from(appState.favorites.songs);
        if (favoriteSongIds.length === 0) {
            overlays.viewer.playlists(
                views.renderEmptyState(
                    "No Favorite Songs", 
                    "You haven't added any songs to your favorites yet.", 
                    "Browse your music and click the heart icon to add favorites."
                )
            );
            return;
        }

        const favoriteSongs = views.getSongsByIds(favoriteSongIds);

        const content = `
            <div class="favorites-page animate__animated animate__fadeIn">
              <div class="page-header mb-8">
                <h1 class="text-3xl font-bold mb-2">Favorite Songs</h1>
                <p class="text-gray-400">${favoriteSongs.length} song${favoriteSongs.length !== 1 ? "s" : ""}</p>
                <div class="flex gap-4 mt-4">
                  <button class="play-all-btn bg-accent-primary text-white px-6 py-2 rounded-full hover:bg-accent-secondary transition-colors flex items-center gap-2">
                    ${ICONS.play}
                    Play All
                  </button>
                  <button class="shuffle-all-btn bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-500 transition-colors flex items-center gap-2">
                    ${ICONS.shuffle}
                    Shuffle
                  </button>
                </div>
              </div>
              <div class="songs-list">
                ${favoriteSongs
                  .map(
                    (song, index) => `
                  <div class="song-row flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}'>
                    <div class="track-number text-gray-400 w-8 text-center">${index + 1}</div>
                    <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="w-12 h-12 rounded object-cover">
                    <div class="song-info flex-1">
                      <div class="song-title font-medium">${song.title}</div>
                      <div class="song-artist text-gray-400 text-sm cursor-pointer hover:text-white transition-colors" data-artist="${song.artist}">${song.artist}</div>
                    </div>
                    <div class="album-name text-gray-400 text-sm hidden md:block">${song.album}</div>
                    <div class="song-duration text-gray-400 text-sm">${song.duration || "0:00"}</div>
                    <div class="song-actions flex items-center gap-2">
                      <button class="action-btn p-2 hover:bg-white/10 rounded transition-colors" data-action="favorite" data-song-id="${song.id}" title="Remove from favorites">
                        <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      </button>
                      <button class="action-btn p-2 hover:bg-white/10 rounded transition-colors" data-action="add-queue" title="Add to queue">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      </button>
                      <button class="action-btn p-2 hover:bg-white/10 rounded transition-colors" data-action="add-playlist" title="Add to playlist">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"/></svg>
                      </button>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `;
        
        overlays.viewer.playlists(content);
        const modalEl = document.getElementById("playlist-viewer");
        views.bindFavoriteSongsEvents(modalEl);
    },

showFavoriteArtists: () => {
    const favoriteArtistNames = Array.from(appState.favorites.artists);
    
    // Get or create modal element
    let modalEl = document.getElementById('favorite-artists-modal');
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'favorite-artists-modal';
        modalEl.className = 'modal-overlay';
        modalEl.innerHTML = `
            <div class="modal-content slide-in">
                <div class="modal-header">
                    <div>
                        <h2 class="modal-title">Favorite Artists</h2>
                        <div class="artist-count">0 artists</div>
                    </div>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="artists-list"></div>
            </div>
        `;
        document.body.appendChild(modalEl);
        
        // Add event listeners for modal
        modalEl.querySelector('.close-btn').addEventListener('click', () => {
            modalEl.style.display = 'none';
        });
        
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                modalEl.style.display = 'none';
            }
        });
    }
    
    const artistsList = modalEl.querySelector('.artists-list');
    const artistCount = modalEl.querySelector('.artist-count');
    
    if (favoriteArtistNames.length === 0) {
        artistsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">♡</div>
                <h3 class="empty-title">No Favorite Artists</h3>
                <p class="empty-text">You haven't added any artists to your favorites yet.</p>
                <p class="empty-subtext">Browse artists and click the heart icon to add favorites.</p>
            </div>
        `;
        artistCount.textContent = "0 artists";
    } else {
        const favoriteArtists = favoriteArtistNames
            .map((artistName) => window.music?.find((a) => a.artist === artistName))
            .filter(Boolean);
        
        artistCount.textContent = `${favoriteArtists.length} artist${favoriteArtists.length !== 1 ? "s" : ""}`;
        
        artistsList.innerHTML = favoriteArtists
            .map((artist) => {
                return `
                    <div class="artist-item" data-artist="${artist.artist}">
                        <div class="artist-image">
                            <img src="${utils.getArtistImageUrl(artist.artist)}" alt="${artist.artist}">
                            <button class="play-btn">
                                ${ICONS.play}
                            </button>
                        </div>
                        <div class="artist-info">
                            <div class="artist-name">${artist.artist}</div>
                            <div class="song-count">${utils.getTotalSongs(artist)} song${utils.getTotalSongs(artist) !== 1 ? "s" : ""}</div>
                        </div>
                    </div>
                `;
            })
            .join('');
        
        // Add event listeners to artist items
        const artistItems = artistsList.querySelectorAll('.artist-item');
        artistItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.play-btn')) {
                    const artistName = item.getAttribute('data-artist');
                    // Handle artist item click
                    console.log('Artist clicked:', artistName);
                }
            });
        });
        
        // Add event listeners to play buttons
        const playButtons = artistsList.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const artistItem = button.closest('.artist-item');
                const artistName = artistItem.getAttribute('data-artist');
                // Handle play button click
                console.log('Play artist:', artistName);
            });
        });
    }
    
    // Show the modal
    modalEl.style.display = 'flex';
},



    bindFavoriteSongsEvents: (root) => {
    },

    bindFavoriteArtistsEvents: (root) => {
    },

    getSongsByIds: (songIds) => {
        const allSongs = [];
        if (window.music) {
            window.music.forEach((artist) => {
                artist.albums.forEach((album) => {
                    album.songs.forEach((song) => {
                        if (songIds.includes(song.id)) {
                            allSongs.push({
                                ...song,
                                artist: artist.artist,
                                album: album.album,
                                cover: utils.getAlbumImageUrl(album.album),
                            });
                        }
                    });
                });
            });
        }
        return allSongs;
    },

    renderEmptyState: (title, subtitle, description) => {
        return `
          <div class="empty-state text-center py-12">
            <div class="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">${title}</h3>
            <p class="text-gray-400 mb-2">${subtitle}</p>
            <p class="text-gray-500 text-sm">${description}</p>
          </div>
        `;
    },

    showLoading: () => {
        const dynamicContent = $byId(IDS.dynamicContent);
        if (dynamicContent) {
            dynamicContent.innerHTML = `
                <div class="loading-state flex items-center justify-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
                </div>
              `;
        }
    },
};

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

const notifications = {
  container: null,
  items: new Set(),

  initialize() {
    if (this.container && document.body.contains(this.container)) return;
    const existing = document.getElementById("toast-portal");
    this.container = existing || document.createElement("div");
    this.container.id = this.container.id || "toast-portal";
    if (!existing) document.body.appendChild(this.container);
  },

  show(message, type = NOTIFICATION_TYPES.INFO, undoCallback = null, options = {}) {
    this.initialize();

    const duration = Number.isFinite(options.duration) ? Math.max(1200, options.duration) : 5000;
    const title = options.title || null;
    const iconHtml = options.iconHtml || TOAST_ICONS[type] || TOAST_ICONS[NOTIFICATION_TYPES.INFO];

    const toast = document.createElement("div");
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.className = `toast-item toast-${type}`;

    if (!prefersReducedMotion) {
      toast.style.animation = "toast-in 200ms cubic-bezier(.2,.8,.25,1) both";
    }

    const iconWrap = document.createElement("div");
    iconWrap.className = "toast-icon";
    iconWrap.innerHTML = iconHtml;

    const content = document.createElement("div");
    content.className = "toast-content";
    content.innerHTML = title
      ? `<strong>${title}</strong>${this.escapeHtml(String(message))}`
      : this.escapeHtml(String(message));

    const actions = document.createElement("div");
    actions.className = "toast-actions";

    if (typeof undoCallback === "function") {
      const undoBtn = document.createElement("button");
      undoBtn.type = "button";
      undoBtn.textContent = "Undo";
      undoBtn.addEventListener("click", () => {
        try { undoCallback(); } catch {}
        dismiss("undo");
      });
      actions.appendChild(undoBtn);
    }

    const progress = document.createElement("div");
    progress.className = "toast-progress";

    toast.appendChild(progress);
    toast.appendChild(iconWrap);
    toast.appendChild(content);
    toast.appendChild(actions);

    this.container.prepend(toast);
    this.items.add(toast);

    const ctrl = this.createTimerController({
      duration,
      onTick: (ratioRemaining) => {
        progress.style.width = (ratioRemaining * 100).toFixed(2) + "%";
      },
      onEnd: () => dismiss("timeout"),
    });

    const pause = () => ctrl.pause();
    const resume = () => ctrl.resume();

    toast.addEventListener("mouseenter", pause);
    toast.addEventListener("mouseleave", resume);
    toast.addEventListener("touchstart", (e) => { pause(); touchStart(e); }, { passive: true });
    toast.addEventListener("touchend", (e) => { touchEnd(e); resume(); });
    toast.addEventListener("touchcancel", (e) => { touchEnd(e); resume(); });

    let drag = null;
    const threshold = 56;
    const maxFade = 80;

    const startDrag = (clientX) => {
      drag = { startX: clientX, lastX: clientX };
      toast.style.transition = "none";
    };
    const onDrag = (clientX) => {
      if (!drag) return;
      drag.lastX = clientX;
      const dx = clientX - drag.startX;
      toast.style.transform = `translateX(${dx}px)`;
      const abs = Math.min(Math.abs(dx), maxFade);
      const alpha = 1 - (abs / maxFade) * 0.85;
      toast.style.opacity = String(Math.max(0.15, alpha));
    };
    const endDrag = () => {
      if (!drag) return;
      const dx = drag.lastX - drag.startX;
      toast.style.transition = "transform 180ms cubic-bezier(.2,.8,.25,1), opacity 160ms linear";
      if (Math.abs(dx) >= threshold) {
        toast.style.animation = dx > 0 ? "toast-swipe-out-right 220ms both" : "toast-swipe-out-left 220ms both";
        setTimeout(() => dismiss("swipe"), 200);
      } else {
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";
      }
      drag = null;
    };

    toast.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      ctrl.pause();
      toast.setPointerCapture?.(e.pointerId);
      startDrag(e.clientX);
    });
    toast.addEventListener("pointermove", (e) => {
      if (!drag) return;
      onDrag(e.clientX);
    });
    toast.addEventListener("pointerup", () => {
      endDrag();
      ctrl.resume();
    });
    toast.addEventListener("pointercancel", () => {
      endDrag();
      ctrl.resume();
    });

    function touchStart(e) {
      const t = e.changedTouches?.[0];
      if (!t) return;
      startDrag(t.clientX);
    }
    function touchEnd(e) {
      const t = e.changedTouches?.[0];
      if (!t) return;
      onDrag(t.clientX);
      endDrag();
    }

    const dismiss = () => {
      if (!this.items.has(toast)) return;
      ctrl.stop();
      this.items.delete(toast);
      if (!prefersReducedMotion) {
        toast.style.animation = "toast-out-up 180ms cubic-bezier(.2,.8,.25,1) forwards";
        setTimeout(() => toast.remove(), 160);
      } else {
        toast.remove();
      }
    };

    return toast;
  },

  createTimerController({ duration, onTick, onEnd }) {
    let start = performance.now();
    let remaining = duration;
    let raf = null;
    let running = true;

    function frame(now) {
      if (!running) return;
      const elapsed = now - start;
      const left = Math.max(0, remaining - elapsed);
      const ratioRemaining = left / duration;
      onTick?.(ratioRemaining);
      if (left <= 0) {
        running = false;
        onEnd?.();
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      pause() {
        if (!running) return;
        running = false;
        remaining -= performance.now() - start;
        if (raf) cancelAnimationFrame(raf);
      },
      resume() {
        if (running) return;
        running = true;
        start = performance.now();
        raf = requestAnimationFrame(frame);
      },
      stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      }
    };
  },

  escapeHtml(s) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },
};



const bindClick = (el, handler) => {
  if (!el || typeof handler !== "function") return;
  const fn = (e) => { e.stopPropagation(); handler(); };
  if (el._clickHandler) el.removeEventListener("click", el._clickHandler);
  el.addEventListener("click", fn);
  el._clickHandler = fn;
};

const bindClickAll = (nodeList, handler) => {
  if (!nodeList) return;
  nodeList.forEach((el) => bindClick(el, handler));
};

const eventHandlers = {
  init: () => {
    eventHandlers.bindMenus();
    eventHandlers.bindControls();
    eventHandlers.bindPopups();
    eventHandlers.bindProgress();
    eventHandlers.bindKeyboard();
    eventHandlers.bindDocument();
  },

  bindControls: () => {
    const idTrigger = $byId(IDS.nowPlayingArea);
    const selTrigger = $bySelector(NAVBAR.nowPlaying);
    [idTrigger, selTrigger].filter(Boolean).forEach((el) => bindClick(el, () => musicPlayer.toggle()));

    const navbarPlayPause = $bySelector(NAVBAR.playPause);
    if (navbarPlayPause) bindClick(navbarPlayPause, () => player.toggle());

    const navbarPrevious = $bySelector(NAVBAR.previous);
    if (navbarPrevious) bindClick(navbarPrevious, () => controls.previous());

    const navbarNext = $bySelector(NAVBAR.next);
    if (navbarNext) bindClick(navbarNext, () => controls.next());
  },

  bindMenus: () => {
    const menuElements = {
      [IDS.menuTrigger]: dropdown.toggle,
      [IDS.dropdownClose]: dropdown.close,
      [IDS.willHideMenu]: dropdown.close,
    };
    Object.entries(menuElements).forEach(([id, handler]) => {
      const el = $byId(id);
      if (el) bindClick(el, handler);
    });

    const menuActions = {
      [IDS.favoriteSongs]: () => { dropdown.close(); views.showFavoriteSongs(); },
      [IDS.favoriteArtists]: () => { dropdown.close(); views.showFavoriteArtists(); },
      [IDS.recentlyPlayed]: () => { dropdown.close(); musicPlayer.open(); setTimeout(() => musicPlayer.switchTab("recent"), 50); },
      [IDS.queueView]: () => { dropdown.close(); musicPlayer.open(); setTimeout(() => musicPlayer.switchTab("queue"), 50); },
      [IDS.createPlaylist]: () => { dropdown.close(); playlists.create(); },
      [IDS.shuffleAll]: controls.shuffle.all,
//      [IDS.themeToggle]: theme.toggle,
    };
    if (IDS.favoriteAlbums) {
      menuActions[IDS.favoriteAlbums] = () => { dropdown.close(); views.showFavoriteAlbums(); };
    }
    Object.entries(menuActions).forEach(([id, handler]) => {
      const el = $byId(id);
      if (el) bindClick(el, handler);
    });
  },

  bindPopups: () => {
    const popupControls = {
      [MUSIC_PLAYER.close]: musicPlayer.close,
      [MUSIC_PLAYER.play]: player.toggle,
      [MUSIC_PLAYER.previous]: controls.previous,
      [MUSIC_PLAYER.next]: controls.next,
      [MUSIC_PLAYER.shuffle]: controls.shuffle.toggle,
      [MUSIC_PLAYER.repeat]: controls.repeat.toggle,
      [MUSIC_PLAYER.favoriteBtn]: () => {
        if (appState.currentSong) {
          appState.favorites.toggle("songs", appState.currentSong.id);
          ui.updateFavoriteButton();
        }
      },
    };
    Object.entries(popupControls).forEach(([selector, handler]) => {
      bindClickAll(document.querySelectorAll(selector), handler);
    });

    document.querySelectorAll(".tab").forEach((tab) => {
      bindClick(tab, () => {
        const tabName = tab.dataset.tab;
        if (tabName) musicPlayer.switchTab(tabName);
      });
    });
  },

  bindProgress: () => {
    const progressBar = $bySelector(MUSIC_PLAYER.progressBar);
    if (!progressBar) return;

    const handleProgressClick = (e) => {
      if (!appState.currentSong || !appState.audio || !appState.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * appState.duration;
      if (!isNaN(newTime) && isFinite(newTime)) controls.seekTo(newTime);
    };

    const startDrag = (e) => {
      if (!appState.currentSong) return;
      progressBar._dragging = true;
      document.body.style.userSelect = "none";
      e.preventDefault();
    };

    const onDrag = (e) => {
      if (!progressBar._dragging || !appState.currentSong || !appState.audio || !appState.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * appState.duration;
      if (!isNaN(newTime) && isFinite(newTime)) controls.seekTo(newTime);
    };

    const endDrag = () => {
      progressBar._dragging = false;
      document.body.style.userSelect = "";
    };

    if (progressBar._clickHandler) progressBar.removeEventListener("click", progressBar._clickHandler);
    progressBar.addEventListener("click", handleProgressClick);
    progressBar._clickHandler = handleProgressClick;

    if (progressBar._startDrag) progressBar.removeEventListener("mousedown", progressBar._startDrag);
    if (progressBar._onDrag) document.removeEventListener("mousemove", progressBar._onDrag);
    if (progressBar._endDrag) document.removeEventListener("mouseup", progressBar._endDrag);

    progressBar.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);

    progressBar._startDrag = startDrag;
    progressBar._onDrag = onDrag;
    progressBar._endDrag = endDrag;
  },

  bindKeyboard: () => {
    if (document._kbHandler) document.removeEventListener("keydown", document._kbHandler);
    const fn = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const shortcuts = {
        " ": (e) => { e.preventDefault(); player.toggle(); },
        ArrowLeft: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); controls.previous(); } },
        ArrowRight: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); controls.next(); } },
        KeyN: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); musicPlayer.open(); } },
        KeyM: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); dropdown.toggle(); } },
        KeyS: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); controls.shuffle.toggle(); } },
        KeyR: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); controls.repeat.toggle(); } },
        Escape: () => { musicPlayer.close(); dropdown.close(); },
      };
      const handler = shortcuts[e.code] || shortcuts[e.key];
      if (handler) handler(e);
    };
    document.addEventListener("keydown", fn);
    document._kbHandler = fn;
  },

  bindDocument: () => {
    if (document._docClickHandler) document.removeEventListener("click", document._docClickHandler);
    const fn = (e) => {
      const dropdownMenu = $byId(IDS.dropdownMenu);
      const menuTrigger = $byId(IDS.menuTrigger);
      if (dropdownMenu && !dropdownMenu.contains(e.target) && !menuTrigger?.contains(e.target)) dropdown.close();

      const drawerEl = $byId(IDS.drawer);
      const nowPlayingEl = $bySelector(NAVBAR.nowPlaying);
      if (appState.isPopupVisible && drawerEl && !drawerEl.contains(e.target) && !nowPlayingEl?.contains(e.target)) musicPlayer.close();

      const navItem = e.target.closest("[data-nav]");
      if (navItem) {
        e.preventDefault();
        const navType = navItem.dataset.nav;
        dropdown.close();
        if (appState.siteMapInstance) {
          const navHandlers = {
            [ROUTES.HOME]: () => appState.siteMapInstance.navigateTo(ROUTES.HOME),
            [ROUTES.ALL_ARTISTS]: () => appState.siteMapInstance.navigateTo(ROUTES.ALL_ARTISTS),
            [ROUTES.ARTIST]: () => {
              const artistName = navItem.dataset.artist;
              if (artistName) appState.siteMapInstance.navigateTo(ROUTES.ARTIST, { artist: artistName });
            },
            [ROUTES.ALBUM]: () => {
              const artist = navItem.dataset.artist;
              const album = navItem.dataset.album;
              if (artist && album) appState.siteMapInstance.navigateTo(ROUTES.ALBUM, { artist, album });
            },
          };
          if (navHandlers[navType]) navHandlers[navType]();
        }
      }

      if (e.target.closest("#" + IDS.globalSearchTrigger)) {
        e.preventDefault();
        dropdown.close();
        if (appState.siteMapInstance) appState.siteMapInstance.openSearchDialog();
      }
    };
    document.addEventListener("click", fn);
    document._docClickHandler = fn;
  },

  bindControlEvents: () => {
    const map = {
      [IDS.playBtn]: player.toggle,
      [IDS.prevBtn]: controls.previous,
      [IDS.nextBtn]: controls.next,
      [IDS.shuffleBtn]: controls.shuffle.toggle,
      [IDS.repeatBtn]: controls.repeat.toggle,
      [IDS.favoriteBtn]: () => { if (appState.currentSong) appState.favorites.toggle("songs", appState.currentSong.id); },
    };
    Object.entries(map).forEach(([id, handler]) => {
      const el = $byId(id);
      if (el) bindClick(el, handler);
    });
  },
};

const app = {
  initialize: () => {
    window.music = music;

    storage.initialize();
//    theme.initialize();
    notifications.initialize();
    
    musicPlayer.init();
    
    player.initialize();

    pageManager.routing.initialize();
    homePage.initialize();

    eventHandlers.init();

    app.resetUI();
    app.syncGlobalState();
  },

  resetUI: () => {
    const nowPlayingArea = $bySelector(NAVBAR.nowPlaying);
    if (nowPlayingArea) {
      nowPlayingArea.classList.remove(CLASSES.hasSong);
    }
    ui.updateCounts();
  },

  syncGlobalState: () => {
    window.appState = appState;
    window.playerController = {
      playSong: player.playSong,
      toggle: player.toggle,
      next: controls.next,
      previous: controls.previous,
      seekTo: controls.seekTo,
      skip: controls.skip(),
    };
    window.musicAppAPI = {
      player,
      controls,
      ui,
      musicPlayer,
      dropdown,
//      theme,
      notifications,
      playlists,
      utils,
      favorites: appState.favorites,
      queue: appState.queue,
      views,
      homePage,
      pageUpdates,
      pageManager,
    };
  },

  goHome: () => {
    if (appState.siteMapInstance) {
      appState.siteMapInstance.navigateTo(ROUTES.HOME);
    }
  },
};

export {
  appState,
  storage,
  mediaSession,
  player,
  controls,
  ui,
  musicPlayer,
  dropdown,
  overlays,
  playlists,
//  theme,
  notifications,
  utils,
  eventHandlers,
  views,
  app
};

document.addEventListener("DOMContentLoaded", () => {
  app.initialize();
});

window.addEventListener("load", () => {
  if (!window.appState) {
    app.initialize();
  }
});

window.MyTunesApp = {
  initialize: app.initialize,
  state: () => appState,
  api: () => window.musicAppAPI,
  goHome: app.goHome,
};

if (window.music) {
  app.initialize();
}      




/**
 * 
 * 
 *    Copyright 2025
 *  William Cole Hanson
 * 
 * Chevrolay@Outlook.com
 * 
 *    m.me/Chevrolay
 * 
 * 
**/
