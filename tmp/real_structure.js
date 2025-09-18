const realCodeStructure = {
  "utils": {
    "type": "object",
    "line": 149,
    "description": "Utility functions for common operations throughout the application",
    "methods": {
      "formatTime": {
        "type": "function",
        "description": "Formats seconds into MM:SS format for display"
      },
      "normalizeForUrl": {
        "type": "function",
        "description": "Normalizes text for URL usage"
      },
      "getAlbumImageUrl": {
        "type": "function",
        "description": "Generates album cover image URL"
      },
      "getArtistImageUrl": {
        "type": "function",
        "description": "Generates artist portrait image URL"
      }
    }
  },
  "theme": {
    "type": "object",
    "line": 242,
    "description": "Theme management system for switching between dark, dim, and light themes",
    "methods": {}
  },
  "loadingBar": {
    "type": "object",
    "line": 268,
    "description": "Loading bar animation and progress tracking system",
    "methods": {}
  },
  "pageUpdates": {
    "type": "object",
    "line": 332,
    "description": "Page content updates and dynamic breadcrumb management",
    "methods": {}
  },
  "overlays": {
    "type": "object",
    "line": 507,
    "description": "Modal dialogs and overlay management system",
    "methods": {}
  },
  "musicPlayer": {
    "type": "object",
    "line": 5298,
    "description": "Music player UI controls and interaction handling",
    "methods": {}
  },
  "siteMap": {
    "type": "object",
    "line": 1015,
    "description": "Application routing and navigation management",
    "methods": {}
  },
  "homePage": {
    "type": "object",
    "line": 1993,
    "description": "Home page content management and rendering",
    "methods": {}
  },
  "storage": {
    "type": "object",
    "line": 2814,
    "description": "Local storage management for user preferences and data",
    "methods": {}
  },
  "mediaSession": {
    "type": "object",
    "line": 2868,
    "description": "Browser media session API integration for system controls",
    "methods": {}
  },
  "player": {
    "type": "object",
    "line": 2926,
    "description": "Core music player functionality with audio management",
    "methods": {
      "playSong": {
        "type": "async function",
        "description": "Plays a song with full loading and UI updates"
      },
      "toggle": {
        "type": "function",
        "description": "Toggles between play and pause states"
      },
      "getNextInAlbum": {
        "type": "function",
        "description": "Gets the next song in current album"
      },
      "getPreviousInAlbum": {
        "type": "function",
        "description": "Gets the previous song in current album"
      }
    }
  },
  "controls": {
    "type": "object",
    "line": 3115,
    "description": "Music player control buttons and interactions",
    "methods": {
      "next": {
        "type": "function",
        "description": "Skip to next song in queue or album"
      },
      "previous": {
        "type": "function",
        "description": "Go to previous song"
      },
      "seek": {
        "type": "function",
        "description": "Seek to specific time position"
      },
      "skip": {
        "type": "function",
        "description": "Skip forward/backward by seconds"
      }
    }
  },
  "ui": {
    "type": "object",
    "line": 3232,
    "description": "User interface updates and state management",
    "methods": {
      "updateNowPlaying": {
        "type": "function",
        "description": "Updates now playing display"
      },
      "updatePlayPauseButtons": {
        "type": "function",
        "description": "Updates play/pause button states"
      },
      "updateProgress": {
        "type": "function",
        "description": "Updates progress bar and time display"
      }
    }
  },
  "dropdown": {
    "type": "object",
    "line": 3378,
    "description": "Dropdown menu management and interactions",
    "methods": {}
  },
  "playlists": {
    "type": "object",
    "line": 3423,
    "description": "Playlist creation, management, and manipulation",
    "methods": {
      "create": {
        "type": "async function",
        "description": "Creates a new playlist"
      },
      "addSong": {
        "type": "function",
        "description": "Adds a song to a playlist"
      },
      "removeSong": {
        "type": "function",
        "description": "Removes a song from a playlist"
      },
      "delete": {
        "type": "async function",
        "description": "Deletes a playlist"
      }
    }
  },
  "views": {
    "type": "object",
    "line": 3891,
    "description": "Different view states and content rendering",
    "methods": {}
  },
  "notifications": {
    "type": "object",
    "line": 4067,
    "description": "Toast notification system with animations",
    "methods": {
      "show": {
        "type": "function",
        "description": "Shows a toast notification"
      },
      "createTimerController": {
        "type": "function",
        "description": "Creates notification timer controller"
      }
    }
  },
  "ACTION_GRID_ITEMS": {
    "type": "array",
    "line": 6,
    "description": "Configuration array for action grid items in the UI",
    "example": "const ACTION_GRID_ITEMS = [\n  { id: 'play-next', icon: 'M9 5l7 7-7 7M15 5v14', label: 'Play Next' },\n  { id: 'add-queue', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', label: 'Add to Queue' }\n];"
  },
  "AppState": {
    "type": "class",
    "line": 15,
    "description": "Main application state management class that handles all global state",
    "methods": {
      "constructor": {
        "type": "function",
        "description": "Initializes the application state with default values"
      }
    },
    "properties": {
      "audio": {
        "type": "HTMLAudioElement",
        "description": "HTML audio element for music playback"
      },
      "currentSong": {
        "type": "Object",
        "description": "Currently playing song object with metadata"
      },
      "isPlaying": {
        "type": "boolean",
        "description": "Current playback state"
      },
      "favorites": {
        "type": "Object",
        "description": "User favorites management system"
      },
      "queue": {
        "type": "Object",
        "description": "Music queue management system"
      }
    }
  },
  "touchStart": {
    "type": "function",
    "line": 4197,
    "description": "touchStart function implementation"
  },
  "touchEnd": {
    "type": "function",
    "line": 4202,
    "description": "touchEnd function implementation"
  },
  "frame": {
    "type": "function",
    "line": 4230,
    "description": "frame function implementation"
  }
};
