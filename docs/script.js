// Fixed Documentation Application
class DocsApp {
    constructor() {
        this.currentSection = null;
        this.searchIndex = [];
        this.codeStructure = {};
        this.isInitialized = false;
        
        // Make instance globally available
        window.docsAppInstance = this;
        
        this.init().catch(error => {
            console.error('Failed to initialize docs app:', error);
            this.showError('Failed to load documentation. Please refresh the page.');
        });
    }

    async init() {
        try {
            this.updateLoadingStatus('Loading code structure...');
            await this.loadCodeStructure();
            
            this.updateLoadingStatus('Setting up event listeners...');
            this.setupEventListeners();
            
            this.updateLoadingStatus('Rendering sidebar...');
            this.renderSidebar();
            
            this.updateLoadingStatus('Updating statistics...');
            this.updateStats();
            
            this.updateLoadingStatus('Finalizing...');
            this.setupSyntaxHighlighting();
            this.initializeTooltips();
            this.setupTheme();
            this.setupAccessibility();
            
            this.isInitialized = true;
            this.hideLoadingScreen();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize documentation.');
        }
    }

    updateLoadingStatus(status) {
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    showError(message) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="text-center">
                    <div class="text-red-500 text-4xl mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 class="text-xl font-bold mb-4">Error Loading Documentation</h2>
                    <p class="text-slate-400 mb-6">${message}</p>
                    <button onclick="location.reload()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
                        <i class="fas fa-redo mr-2"></i>Retry
                    </button>
                </div>
            `;
        }
    }

    async loadCodeStructure() {
        const progressBar = document.getElementById('loading-progress');
        let progress = 0;
        
        const updateProgress = (value) => {
            progress = value;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        };

        updateProgress(20);
        await this.sleep(100);
        
        // Parse the JavaScript code structure
        this.codeStructure = this.parseCodeStructure();
        updateProgress(60);
        await this.sleep(100);
        
        // Build search index
        this.buildSearchIndex();
        updateProgress(80);
        await this.sleep(100);
        
        updateProgress(100);
        await this.sleep(200);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    parseCodeStructure() {
        // Real parsed structure from global.js (5,493 lines)
        return {
            "utils": {
                "type": "object",
                "line": 149,
                "description": "Utility functions for common operations throughout the application",
                "methods": {
                    "formatTime": {
                        "type": "function",
                        "description": "Formats seconds into MM:SS format for display",
                        "parameters": ["seconds: number"],
                        "returns": "string",
                        "example": "utils.formatTime(125) // \"2:05\""
                    },
                    "normalizeForUrl": {
                        "type": "function",
                        "description": "Normalizes text for URL usage by removing special characters",
                        "parameters": ["text: string"],
                        "returns": "string",
                        "example": "utils.normalizeForUrl(\"The Beatles!\") // \"thebeatles\""
                    },
                    "getAlbumImageUrl": {
                        "type": "function",
                        "description": "Generates album cover image URL from album name",
                        "parameters": ["albumName: string"],
                        "returns": "string",
                        "example": "utils.getAlbumImageUrl(\"Abbey Road\") // URL string"
                    },
                    "getArtistImageUrl": {
                        "type": "function",
                        "description": "Generates artist portrait image URL from artist name",
                        "parameters": ["artistName: string"],
                        "returns": "string"
                    }
                }
            },
            "theme": {
                "type": "object",
                "line": 242,
                "description": "Theme management system for switching between dark, dim, and light themes",
                "methods": {
                    "get": {
                        "type": "function",
                        "description": "Gets the current active theme",
                        "returns": "string",
                        "example": "const currentTheme = theme.get(); // \"dark\", \"dim\", or \"light\""
                    },
                    "set": {
                        "type": "function",
                        "description": "Sets the application theme and saves preference",
                        "parameters": ["theme: string"],
                        "returns": "void"
                    },
                    "toggle": {
                        "type": "function",
                        "description": "Cycles through available themes",
                        "returns": "void"
                    }
                }
            },
            "loadingBar": {
                "type": "object",
                "line": 268,
                "description": "Loading bar animation and progress tracking system",
                "methods": {
                    "initialize": {
                        "type": "function",
                        "description": "Initializes the loading bar animation system"
                    },
                    "animate": {
                        "type": "function",
                        "description": "Animates the loading bar with random steps"
                    }
                }
            },
            "pageUpdates": {
                "type": "object",
                "line": 332,
                "description": "Page content updates and dynamic breadcrumb management",
                "methods": {
                    "updateBreadcrumbs": {
                        "type": "function",
                        "description": "Updates breadcrumb navigation dynamically"
                    }
                }
            },
            "overlays": {
                "type": "object",
                "line": 507,
                "description": "Modal dialogs and overlay management system",
                "methods": {
                    "show": {
                        "type": "function",
                        "description": "Shows a modal overlay"
                    },
                    "hide": {
                        "type": "function",
                        "description": "Hides modal overlays"
                    }
                }
            },
            "musicPlayer": {
                "type": "object",
                "line": 5298,
                "description": "Music player UI controls and interaction handling",
                "methods": {
                    "show": {
                        "type": "function",
                        "description": "Shows the music player drawer"
                    },
                    "hide": {
                        "type": "function",
                        "description": "Hides the music player drawer"
                    },
                    "updateQueue": {
                        "type": "function",
                        "description": "Updates the music queue display"
                    }
                }
            },
            "siteMap": {
                "type": "object",
                "line": 1015,
                "description": "Application routing and navigation management",
                "methods": {
                    "initialize": {
                        "type": "function",
                        "description": "Initializes the routing system"
                    },
                    "loadHomePage": {
                        "type": "function",
                        "description": "Loads the home page content"
                    },
                    "loadArtistPage": {
                        "type": "function",
                        "description": "Loads artist page content"
                    }
                }
            },
            "homePage": {
                "type": "object",
                "line": 1993,
                "description": "Home page content management and rendering",
                "methods": {
                    "loadContent": {
                        "type": "function",
                        "description": "Loads and renders home page content"
                    },
                    "updateRecentlyPlayed": {
                        "type": "function",
                        "description": "Updates recently played section"
                    }
                }
            },
            "storage": {
                "type": "object",
                "line": 2814,
                "description": "Local storage management for user preferences and data",
                "methods": {
                    "save": {
                        "type": "function",
                        "description": "Saves data to localStorage",
                        "parameters": ["key: string", "data: any"]
                    },
                    "load": {
                        "type": "function",
                        "description": "Loads data from localStorage",
                        "parameters": ["key: string"],
                        "returns": "any"
                    }
                }
            },
            "mediaSession": {
                "type": "object",
                "line": 2868,
                "description": "Browser media session API integration for system controls",
                "methods": {
                    "update": {
                        "type": "function",
                        "description": "Updates media session metadata"
                    }
                }
            },
            "player": {
                "type": "object",
                "line": 2926,
                "description": "Core music player functionality with audio management",
                "methods": {
                    "playSong": {
                        "type": "async function",
                        "description": "Plays a song with full loading, UI updates, and error handling",
                        "parameters": ["songData: Object"],
                        "returns": "Promise<void>",
                        "example": `await player.playSong({
  id: "song-123",
  title: "Song Title",
  artist: "Artist Name",
  album: "Album Name"
});`
                    },
                    "toggle": {
                        "type": "function",
                        "description": "Toggles between play and pause states",
                        "returns": "void",
                        "example": "player.toggle(); // Plays if paused, pauses if playing"
                    },
                    "getNextInAlbum": {
                        "type": "function",
                        "description": "Gets the next song in current album",
                        "returns": "Object|null"
                    },
                    "getPreviousInAlbum": {
                        "type": "function",
                        "description": "Gets the previous song in current album",
                        "returns": "Object|null"
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
                        "description": "Skip to next song in queue or album",
                        "returns": "void",
                        "example": "controls.next();"
                    },
                    "previous": {
                        "type": "function",
                        "description": "Go to previous song or restart current",
                        "returns": "void",
                        "example": "controls.previous();"
                    },
                    "seek": {
                        "type": "function",
                        "description": "Seek to specific time position",
                        "parameters": ["time: number"],
                        "returns": "void"
                    },
                    "skip": {
                        "type": "function",
                        "description": "Skip forward/backward by seconds",
                        "parameters": ["seconds: number"],
                        "returns": "void"
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
                        "description": "Updates now playing display with current song info",
                        "returns": "void"
                    },
                    "updatePlayPauseButtons": {
                        "type": "function",
                        "description": "Updates play/pause button states across the UI",
                        "returns": "void"
                    },
                    "updateProgress": {
                        "type": "function",
                        "description": "Updates progress bar and time display",
                        "returns": "void"
                    },
                    "updateFavoriteButton": {
                        "type": "function",
                        "description": "Updates favorite button state for current song",
                        "returns": "void"
                    }
                }
            },
            "dropdown": {
                "type": "object",
                "line": 3378,
                "description": "Dropdown menu management and interactions",
                "methods": {
                    "toggle": {
                        "type": "function",
                        "description": "Toggles dropdown menu visibility"
                    },
                    "show": {
                        "type": "function",
                        "description": "Shows dropdown menu"
                    },
                    "hide": {
                        "type": "function",
                        "description": "Hides dropdown menu"
                    }
                }
            },
            "playlists": {
                "type": "object",
                "line": 3423,
                "description": "Playlist creation, management, and manipulation",
                "methods": {
                    "create": {
                        "type": "async function",
                        "description": "Shows prompt to create new playlist and adds it to user's collection",
                        "returns": "Promise<Object|null>",
                        "example": "const playlist = await playlists.create();"
                    },
                    "addSong": {
                        "type": "function",
                        "description": "Adds a song to an existing playlist",
                        "parameters": ["playlistId: string", "song: Object"],
                        "returns": "boolean"
                    },
                    "removeSong": {
                        "type": "function",
                        "description": "Removes a song from a playlist",
                        "parameters": ["playlistId: string", "songIndex: number"],
                        "returns": "boolean"
                    },
                    "delete": {
                        "type": "async function",
                        "description": "Deletes a playlist after user confirmation",
                        "parameters": ["playlistId: string"],
                        "returns": "Promise<boolean>"
                    }
                }
            },
            "views": {
                "type": "object",
                "line": 3891,
                "description": "Different view states and content rendering",
                "methods": {
                    "showFavoriteSongs": {
                        "type": "function",
                        "description": "Shows favorite songs view"
                    },
                    "showFavoriteArtists": {
                        "type": "function",
                        "description": "Shows favorite artists view"
                    }
                }
            },
            "notifications": {
                "type": "object",
                "line": 4067,
                "description": "Advanced toast notification system with animations and undo support",
                "methods": {
                    "show": {
                        "type": "function",
                        "description": "Shows a toast notification with type, duration, and undo support",
                        "parameters": ["message: string", "type: string", "undoCallback: function", "options: Object"],
                        "returns": "HTMLElement",
                        "example": `notifications.show("Success!", "success");
notifications.show("Deleted", "warning", () => undo());`
                    },
                    "createTimerController": {
                        "type": "function",
                        "description": "Creates notification timer controller for precise timing",
                        "returns": "Object"
                    }
                }
            },
            "ACTION_GRID_ITEMS": {
                "type": "array",
                "line": 6,
                "description": "Configuration array for action grid items in the UI",
                "example": `const ACTION_GRID_ITEMS = [
  { id: 'play-next', icon: 'M9 5l7 7-7 7M15 5v14', label: 'Play Next' },
  { id: 'add-queue', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', label: 'Add to Queue' },
  { id: 'add-playlist', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10', label: 'Add to Playlist' },
  { id: 'share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z', label: 'Share' },
  { id: 'download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', label: 'Download' },
  { id: 'view-artist', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'View Artist' }
];`
            },
            "AppState": {
                "type": "class",
                "line": 15,
                "description": "Main application state management class that handles all global state",
                "methods": {
                    "constructor": {
                        "type": "function",
                        "description": "Initializes the application state with default values",
                        "parameters": [],
                        "returns": "void",
                        "example": "const appState = new AppState();"
                    }
                },
                "properties": {
                    "audio": { "type": "HTMLAudioElement", "description": "HTML audio element for music playback" },
                    "currentSong": { "type": "Object", "description": "Currently playing song object with metadata" },
                    "currentArtist": { "type": "string", "description": "Currently playing artist name" },
                    "currentAlbum": { "type": "string", "description": "Currently playing album name" },
                    "isPlaying": { "type": "boolean", "description": "Current playback state (true/false)" },
                    "duration": { "type": "number", "description": "Duration of current song in seconds" },
                    "recentlyPlayed": { "type": "Array", "description": "Array of recently played songs" },
                    "isDragging": { "type": "boolean", "description": "Whether user is dragging progress bar" },
                    "shuffleMode": { "type": "boolean", "description": "Whether shuffle mode is enabled" },
                    "repeatMode": { "type": "string", "description": "Current repeat mode (off, one, all)" },
                    "currentIndex": { "type": "number", "description": "Current song index in album" },
                    "playlists": { "type": "Array", "description": "User's playlists collection" },
                    "favorites": { "type": "Object", "description": "User favorites management system with sets for songs, artists, albums" },
                    "queue": { "type": "Object", "description": "Music queue management system with add/remove methods" }
                },
                "example": `class AppState {
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
    this.currentIndex = 0;
    this.playlists = [];
    this.favorites = {
      songs: new Set(),
      artists: new Set(), 
      albums: new Set()
    };
    this.queue = {
      items: []
    };
  }
}`
            },
            "touchStart": {
                "type": "function",
                "line": 4197,
                "description": "Touch start event handler for mobile interactions"
            },
            "touchEnd": {
                "type": "function",
                "line": 4202,
                "description": "Touch end event handler for mobile interactions"
            },
            "frame": {
                "type": "function",
                "line": 4230,
                "description": "Animation frame function for smooth UI updates"
            }
        };
    }

    buildSearchIndex() {
        this.searchIndex = [];
        
        const indexItem = (path, item, parentPath = '') => {
            const fullPath = parentPath ? `${parentPath}.${path}` : path;
            
            this.searchIndex.push({
                path: fullPath,
                name: path,
                type: item.type,
                description: item.description || '',
                keywords: [path, item.type, item.description || ''].join(' ').toLowerCase()
            });

            if (item.methods) {
                Object.entries(item.methods).forEach(([methodName, method]) => {
                    indexItem(methodName, method, fullPath);
                });
            }

            if (item.properties) {
                Object.entries(item.properties).forEach(([propName, prop]) => {
                    indexItem(propName, prop, fullPath);
                });
            }
        };

        Object.entries(this.codeStructure).forEach(([key, value]) => {
            indexItem(key, value);
        });
    }

    renderSidebar() {
        const nav = document.getElementById('sidebar-nav');
        if (!nav) return;
        
        nav.innerHTML = '';

        Object.entries(this.codeStructure).forEach(([key, value]) => {
            const item = this.createSidebarItem(key, value, 0);
            nav.appendChild(item);
        });
    }

    createSidebarItem(name, item, depth = 0) {
        const div = document.createElement('div');
        div.className = 'slide-in';
        
        const button = document.createElement('button');
        button.className = `sidebar-item w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${depth > 0 ? 'ml-4 border-l border-slate-600 pl-4' : ''}`;
        
        const leftContent = document.createElement('div');
        leftContent.className = 'flex items-center space-x-2';
        
        const icon = document.createElement('i');
        icon.className = `fas ${this.getTypeIcon(item.type)} text-xs`;
        leftContent.appendChild(icon);
        
        const badge = document.createElement('span');
        badge.className = `method-badge method-${item.type}`;
        badge.textContent = item.type;
        leftContent.appendChild(badge);
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        nameSpan.className = 'font-medium';
        leftContent.appendChild(nameSpan);
        
        button.appendChild(leftContent);
        
        button.addEventListener('click', () => {
            this.showItemDetails(name, item);
            this.setActiveSidebarItem(button);
        });
        
        div.appendChild(button);
        return div;
    }

    getTypeIcon(type) {
        const icons = {
            'class': 'fa-cube',
            'object': 'fa-box',
            'function': 'fa-bolt',
            'async function': 'fa-sync',
            'property': 'fa-tag',
            'boolean': 'fa-toggle-on',
            'string': 'fa-quote-right',
            'number': 'fa-hashtag',
            'array': 'fa-list',
            'HTMLElement': 'fa-code'
        };
        return icons[type] || 'fa-circle';
    }

    showItemDetails(name, item) {
        document.getElementById('welcome-section').classList.add('hidden');
        const contentArea = document.getElementById('content-area');
        contentArea.classList.remove('hidden');
        contentArea.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'fade-in';
        
        // Header
        const header = document.createElement('div');
        header.className = 'mb-8';
        header.innerHTML = `
            <div class="flex items-center space-x-4 mb-4">
                <h1 class="text-3xl font-bold">${name}</h1>
                <span class="method-badge method-${item.type}">
                    <i class="fas ${this.getTypeIcon(item.type)}"></i>
                    ${item.type}
                </span>
            </div>
            <p class="text-slate-400 text-lg">${item.description || 'No description available'}</p>
        `;
        container.appendChild(header);

        // Code example
        if (item.example) {
            const codeSection = this.createCodeSection(name, item);
            container.appendChild(codeSection);
        }

        // Methods and properties
        if (item.methods || item.properties) {
            const detailsSection = this.createDetailsSection(item);
            container.appendChild(detailsSection);
        }

        contentArea.appendChild(container);
        this.setupSyntaxHighlighting();
    }

    createCodeSection(name, item) {
        const section = document.createElement('div');
        section.className = 'mb-8';
        
        section.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold">Code Example</h2>
                <button class="copy-btn p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" data-code="${encodeURIComponent(item.example)}">
                    <i class="fas fa-copy text-sm"></i>
                </button>
            </div>
            <div class="code-block">
                <pre class="language-javascript"><code>${this.escapeHtml(item.example)}</code></pre>
            </div>
        `;

        // Bind copy button
        const copyBtn = section.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                this.copyToClipboard(decodeURIComponent(e.target.closest('button').dataset.code));
            });
        }

        return section;
    }

    createDetailsSection(item) {
        const section = document.createElement('div');
        section.className = 'mb-8';
        
        let content = '<h2 class="text-xl font-semibold mb-4">Details</h2>';
        
        if (item.methods) {
            content += `
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-3">Methods</h3>
                    <div class="space-y-3">
                        ${Object.entries(item.methods).map(([method, details]) => `
                            <div class="bg-slate-800/50 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <code class="text-green-400 font-medium">${method}()</code>
                                    <span class="method-badge method-function">${details.type || 'function'}</span>
                                </div>
                                <p class="text-slate-400 text-sm">${details.description || 'No description'}</p>
                                ${details.parameters ? `
                                    <div class="mt-2 text-xs text-slate-500">
                                        Parameters: ${details.parameters.join(', ')}
                                    </div>
                                ` : ''}
                                ${details.returns ? `
                                    <div class="mt-1 text-xs text-slate-500">
                                        Returns: ${details.returns}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (item.properties) {
            content += `
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-3">Properties</h3>
                    <div class="space-y-3">
                        ${Object.entries(item.properties).map(([prop, details]) => `
                            <div class="bg-slate-800/50 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <code class="text-blue-400 font-medium">${prop}</code>
                                    <span class="method-badge method-property">${details.type || 'property'}</span>
                                </div>
                                <p class="text-slate-400 text-sm">${details.description || 'No description'}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        section.innerHTML = content;
        return section;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('filter-type');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterSidebar(e.target.value);
            });
        }

        // Theme toggle removed - using GitHub Dark Dimmed theme only

        // Tab navigation
        this.setupTabNavigation();

        // Menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const menuDropdown = document.getElementById('menu-dropdown');
        if (menuToggle && menuDropdown) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                menuDropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                menuDropdown.classList.add('hidden');
            });
        }

        // Scroll to top
        const scrollBtn = document.getElementById('scroll-to-top');
        if (scrollBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollBtn.classList.remove('hidden');
                } else {
                    scrollBtn.classList.add('hidden');
                }
            });

            scrollBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Welcome section cards
        document.querySelectorAll('[data-section]').forEach(card => {
            card.addEventListener('click', () => {
                this.showSection(card.dataset.section);
            });
        });
    }

    performSearch(query) {
        if (query.length < 2) return;

        const results = this.searchIndex.filter(item => 
            item.keywords.includes(query.toLowerCase())
        ).slice(0, 10);

        console.log('Search results:', results);
        // You can implement search results display here
    }

    filterSidebar(type) {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        
        sidebarItems.forEach(item => {
            const badge = item.querySelector('.method-badge');
            if (badge) {
                const itemType = badge.textContent.trim();
                if (type === 'all' || itemType === type) {
                    item.closest('div').style.display = 'block';
                } else {
                    item.closest('div').style.display = 'none';
                }
            }
        });
    }

    setActiveSidebarItem(button) {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        button.classList.add('active');
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Code copied to clipboard!', 'success');
            }).catch(() => {
                this.showToast('Failed to copy code', 'error');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showToast('Code copied to clipboard!', 'success');
            } catch (err) {
                this.showToast('Failed to copy code', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        
        const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        }[type] || 'bg-blue-500';
        
        toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    setupTabNavigation() {
        // Tab switching functionality
        document.querySelectorAll('.docs-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.closest('.docs-tab').dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Source code specific functionality
        this.setupSourceCodeTab();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.docs-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.classList.add('border-transparent', 'text-slate-400');
            tab.classList.remove('border-primary', 'text-primary');
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.classList.remove('border-transparent', 'text-slate-400');
            activeTab.classList.add('border-primary', 'text-primary');
        }

        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const tabContent = document.getElementById(`${tabName}-tab-content`);
        if (tabContent) {
            tabContent.classList.remove('hidden');
        }

        // Load content if needed
        if (tabName === 'source-code') {
            this.loadSourceCode();
        }
    }

    setupSourceCodeTab() {
        // Copy source code button
        const copyBtn = document.getElementById('copy-source-code');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copySourceCode();
            });
        }

        // Toggle line numbers
        const lineNumbersBtn = document.getElementById('toggle-line-numbers');
        if (lineNumbersBtn) {
            lineNumbersBtn.addEventListener('click', () => {
                this.toggleLineNumbers();
            });
        }

        // Toggle indicators
        const indicatorsBtn = document.getElementById('toggle-indicators');
        if (indicatorsBtn) {
            indicatorsBtn.addEventListener('click', () => {
                this.toggleIndicators();
            });
        }
    }

    async loadSourceCode() {
        const codeContent = document.getElementById('source-code-content');
        const lineNumbers = document.getElementById('line-numbers');
        
        if (!codeContent || !lineNumbers) return;

        try {
            // Show loading state
            codeContent.textContent = '// Loading global.js source code...';
            
            // Fetch the source code
            const response = await fetch('../siteScripts/global.js');
            const sourceCode = await response.text();
            
            // Update the content
            codeContent.textContent = sourceCode;
            
            // Generate line numbers
            const lines = sourceCode.split('\n');
            lineNumbers.innerHTML = lines.map((_, index) => 
                `<div class="line-number" data-line="${index + 1}">${index + 1}</div>`
            ).join('');
            
            // Add interactive indicators
            this.addInteractiveIndicators(sourceCode, lines);
            
            // Apply syntax highlighting
            if (window.Prism) {
                Prism.highlightElement(codeContent);
            }
            
        } catch (error) {
            console.error('Failed to load source code:', error);
            codeContent.textContent = '// Error loading source code. Please check the file path.';
        }
    }

    addInteractiveIndicators(sourceCode, lines) {
        const codeContent = document.getElementById('source-code-content');
        
        // Find important code structures and add indicators
        const indicatorPositions = [];
        
        // Find class, function, object declarations
        Object.entries(this.codeStructure).forEach(([name, item]) => {
            if (item.line) {
                indicatorPositions.push({
                    line: item.line - 1, // Convert to 0-based index
                    name: name,
                    type: item.type,
                    description: item.description || ''
                });
            }
        });
        
        // Sort by line number
        indicatorPositions.sort((a, b) => a.line - b.line);
        
        // Add indicators to the HTML
        let htmlLines = lines.map((line, index) => {
            const indicator = indicatorPositions.find(pos => pos.line === index);
            if (indicator) {
                return line + `<span class="code-indicator ${indicator.type}" data-name="${indicator.name}" data-type="${indicator.type}" data-line="${index + 1}">
                    <div class="indicator-tooltip">${indicator.name} (${indicator.type})<br><small>${indicator.description}</small></div>
                </span>`;
            }
            return line;
        });
        
        codeContent.innerHTML = htmlLines.join('\n');
        
        // Add click handlers for indicators
        document.querySelectorAll('.code-indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = indicator.dataset.name;
                const type = indicator.dataset.type;
                const line = indicator.dataset.line;
                
                this.showIndicatorModal(name, type, line);
            });
        });
    }

    showIndicatorModal(name, type, line) {
        const item = this.codeStructure[name];
        if (!item) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-primary">${name}</h3>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">${type}</span>
                                <span class="text-slate-400 text-sm">Line ${line}</span>
                            </div>
                        </div>
                        <button class="text-slate-400 hover:text-white text-xl" onclick="this.closest('.fixed').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <p class="text-slate-300">${item.description || 'No description available.'}</p>
                        
                        ${item.methods ? `
                        <div>
                            <h4 class="font-semibold text-slate-200 mb-2">Methods</h4>
                            <div class="space-y-2">
                                ${Object.entries(item.methods).map(([methodName, method]) => `
                                    <div class="bg-slate-900/50 rounded p-3">
                                        <code class="text-blue-400">${methodName}()</code>
                                        <p class="text-sm text-slate-400 mt-1">${method.description || ''}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="flex justify-between items-center pt-4 border-t border-slate-700">
                            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors" onclick="window.docsAppInstance.switchTab('documentation'); window.docsAppInstance.showItemDetails('${name}', window.docsAppInstance.codeStructure['${name}']); this.closest('.fixed').remove();">
                                <i class="fas fa-book mr-2"></i>View Full Documentation
                            </button>
                            <button class="text-slate-400 hover:text-white" onclick="this.closest('.fixed').remove()">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    copySourceCode() {
        const codeContent = document.getElementById('source-code-content');
        if (!codeContent) return;
        
        const text = codeContent.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Source code copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Source code copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('Failed to copy source code', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    toggleLineNumbers() {
        const lineNumbers = document.getElementById('line-numbers');
        const btn = document.getElementById('toggle-line-numbers');
        
        if (lineNumbers && btn) {
            lineNumbers.style.display = lineNumbers.style.display === 'none' ? 'block' : 'none';
            btn.classList.toggle('bg-slate-600');
        }
    }

    toggleIndicators() {
        const indicators = document.querySelectorAll('.code-indicator');
        const btn = document.getElementById('toggle-indicators');
        
        if (btn) {
            const isHidden = btn.classList.contains('bg-slate-600');
            
            indicators.forEach(indicator => {
                indicator.style.display = isHidden ? 'inline-block' : 'none';
            });
            
            btn.classList.toggle('bg-slate-600');
        }
    }

    setupSyntaxHighlighting() {
        if (window.Prism) {
            try {
                Prism.highlightAll();
            } catch (error) {
                console.warn('Prism highlighting failed:', error);
            }
        }
    }

    initializeTooltips() {
        // Basic tooltip implementation since tippy.js might not load
        document.querySelectorAll('[title]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'fixed bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg z-50 pointer-events-none';
                tooltip.textContent = e.target.title;
                tooltip.style.left = e.clientX + 'px';
                tooltip.style.top = (e.clientY - 30) + 'px';
                document.body.appendChild(tooltip);
                
                e.target.addEventListener('mouseleave', () => {
                    if (document.body.contains(tooltip)) {
                        document.body.removeChild(tooltip);
                    }
                }, { once: true });
            });
        });
    }

    setupTheme() {
        // Force GitHub Dark Dimmed theme only
        document.documentElement.className = 'dark github-dimmed';
    }

    setupAccessibility() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('global-search');
                if (searchInput) searchInput.focus();
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // Theme toggle removed - using GitHub Dark Dimmed theme only

    updateStats() {
        const stats = {
            objects: 0,
            functions: 0,
            properties: 0,
            lines: 5493
        };

        this.searchIndex.forEach(item => {
            if (item.type === 'object' || item.type === 'class') {
                stats.objects++;
            } else if (item.type.includes('function')) {
                stats.functions++;
            } else {
                stats.properties++;
            }
        });

        this.animateCounter('stats-objects', stats.objects);
        this.animateCounter('stats-functions', stats.functions);
        this.animateCounter('stats-properties', stats.properties);
        this.animateCounter('stats-lines', stats.lines);
    }

    animateCounter(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let current = 0;
        const increment = target / 30;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 50);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSection(sectionName) {
        switch(sectionName) {
            case 'getting-started':
                this.showGettingStarted();
                break;
            case 'api-reference':
                this.showApiReference();
                break;
            case 'examples':
                this.showExamples();
                break;
            case 'source-code':
                this.showSourceCode();
                break;
        }
    }

    showGettingStarted() {
        const contentArea = document.getElementById('content-area');
        document.getElementById('welcome-section').classList.add('hidden');
        contentArea.classList.remove('hidden');
        
        contentArea.innerHTML = `
            <div class="fade-in">
                <h1 class="text-3xl font-bold mb-6">Getting Started with MyTunes</h1>
                <div class="prose prose-invert max-w-none">
                    <p class="text-lg text-slate-400 mb-6">MyTunes is a comprehensive music player application built with modern JavaScript. This guide will help you understand the core concepts and get you started with using the codebase.</p>
                    
                    <h2 class="text-2xl font-semibold mb-4">Quick Start</h2>
                    <div class="code-block mb-6">
                        <pre class="language-javascript"><code>// Initialize the MyTunes application
app.initialize();

// The app state is now available globally
console.log(appState.currentSong);
console.log(appState.isPlaying);</code></pre>
                    </div>
                    
                    <h2 class="text-2xl font-semibold mb-4">Basic Usage</h2>
                    <div class="code-block mb-6">
                        <pre class="language-javascript"><code>// Play a song
await player.playSong({
    id: "song-123",
    title: "My Favorite Song",
    artist: "Great Artist",
    album: "Amazing Album"
});

// Control playback
player.toggle(); // Play/pause
controls.next(); // Next song
controls.previous(); // Previous song</code></pre>
                    </div>
                </div>
            </div>
        `;
        
        this.setupSyntaxHighlighting();
    }

    showApiReference() {
        const firstObject = Object.keys(this.codeStructure)[0];
        this.showItemDetails(firstObject, this.codeStructure[firstObject]);
    }

    showExamples() {
        const contentArea = document.getElementById('content-area');
        document.getElementById('welcome-section').classList.add('hidden');
        contentArea.classList.remove('hidden');
        
        contentArea.innerHTML = `
            <div class="fade-in">
                <h1 class="text-3xl font-bold mb-6">Code Examples</h1>
                <div class="space-y-8">
                    <div class="bg-slate-800/50 rounded-xl p-6">
                        <h3 class="text-xl font-semibold mb-4">Playing Music</h3>
                        <div class="code-block">
                            <pre class="language-javascript"><code>// Play a song with full metadata
const songData = {
    id: "song-123",
    title: "My Favorite Song",
    artist: "Great Artist",
    album: "Amazing Album"
};

await player.playSong(songData);</code></pre>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800/50 rounded-xl p-6">
                        <h3 class="text-xl font-semibold mb-4">Managing Favorites</h3>
                        <div class="code-block">
                            <pre class="language-javascript"><code>// Add to favorites
appState.favorites.add("songs", "song-123");

// Check if favorited
const isFavorite = appState.favorites.has("songs", "song-123");

// Toggle favorite status
appState.favorites.toggle("songs", "song-123");</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupSyntaxHighlighting();
    }

    showSourceCode() {
        const contentArea = document.getElementById('content-area');
        document.getElementById('welcome-section').classList.add('hidden');
        contentArea.classList.remove('hidden');
        
        contentArea.innerHTML = `
            <div class="mb-8">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h1 class="text-3xl font-bold gradient-text mb-2">Source Code Viewer</h1>
                        <p class="text-slate-400">Interactive view of global.js with documentation links</p>
                    </div>
                    <div class="flex gap-2">
                        <button id="toggle-indicators" class="source-control-btn">
                            <i class="fas fa-eye"></i> Toggle Indicators
                        </button>
                        <button id="collapse-all" class="source-control-btn">
                            <i class="fas fa-compress"></i> Collapse All
                        </button>
                        <button id="expand-all" class="source-control-btn">
                            <i class="fas fa-expand"></i> Expand All
                        </button>
                    </div>
                </div>
                
                <div class="source-viewer">
                    <div class="source-header">
                        <div class="source-language">
                            <i class="fab fa-js-square mr-2"></i>
                            JavaScript • global.js • 5,493 lines
                        </div>
                        <div class="source-controls">
                            <button class="source-control-btn" onclick="window.docsAppInstance.copySourceCode()">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                            <button class="source-control-btn" onclick="window.docsAppInstance.downloadSource()">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    </div>
                    <div class="source-content" id="source-content">
                        <div class="source-line-numbers" id="line-numbers"></div>
                        <div class="source-code" id="source-code-content">
                            <div class="flex items-center justify-center py-20">
                                <div class="text-center">
                                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                                    <p class="text-slate-400">Loading source code...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.loadSourceCode();
    }

    async loadSourceCode() {
        try {
            // Try multiple possible paths for the global.js file
            const possiblePaths = [
                '../siteScripts/global.js',
                './siteScripts/global.js',
                '/siteScripts/global.js',
                'siteScripts/global.js'
            ];
            
            let sourceCode = null;
            let loadedFromPath = null;
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        sourceCode = await response.text();
                        loadedFromPath = path;
                        break;
                    }
                } catch (e) {
                    // Continue to next path
                    continue;
                }
            }
            
            if (!sourceCode) {
                // If we can't load the actual file, create a mock version based on our parsed structure
                sourceCode = this.generateMockSourceCode();
                this.showToast('Loaded mock source code for demonstration', 'info');
            }
            
            this.renderSourceCodeWithIndicators(sourceCode);
        } catch (error) {
            console.error('Error loading source code:', error);
            // Fallback to mock source code
            const mockSource = this.generateMockSourceCode();
            this.renderSourceCodeWithIndicators(mockSource);
            this.showToast('Loaded mock source code for demonstration', 'warning');
        }
    }

    generateMockSourceCode() {
        // Generate a representative mock of the global.js file based on our parsed structure
        let mockCode = `/*
 * MyTunes Global.js - Music Player Application
 * This is a mock representation of the actual global.js file
 * Generated from the parsed code structure for demonstration
 */

`;
        
        // Add imports and initial setup
        mockCode += `// Utility functions and helpers
const utils = {
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Theme management system
const theme = {
    get: () => document.documentElement.getAttribute("data-theme") || "dark",
    set: (themeName) => {
        document.documentElement.setAttribute("data-theme", themeName);
        localStorage.setItem("preferred-theme", themeName);
    },
    toggle: () => {
        const current = theme.get();
        const newTheme = current === "dark" ? "light" : "dark";
        theme.set(newTheme);
    }
};

// Loading bar management
const loadingBar = {
    show: () => {
        const bar = document.getElementById('loading-bar');
        if (bar) bar.style.display = 'block';
    },
    
    hide: () => {
        const bar = document.getElementById('loading-bar');
        if (bar) bar.style.display = 'none';
    },
    
    setProgress: (percent) => {
        const progress = document.querySelector('#loading-bar .progress');
        if (progress) progress.style.width = percent + '%';
    }
};

// Page update management
const pageUpdates = {
    updateTitle: (title) => {
        document.title = title || 'MyTunes';
    },
    
    updateFavicon: (iconUrl) => {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = iconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
};

// Music player core functionality
const musicPlayer = {
    currentTrack: null,
    isPlaying: false,
    volume: 1.0,
    
    async loadTrack(trackData) {
        this.currentTrack = trackData;
        const audio = document.getElementById('audio-player');
        if (audio && trackData.url) {
            audio.src = trackData.url;
            await audio.load();
        }
    },
    
    async play() {
        const audio = document.getElementById('audio-player');
        if (audio) {
            try {
                await audio.play();
                this.isPlaying = true;
                this.updatePlayButton();
            } catch (error) {
                console.error('Playback failed:', error);
            }
        }
    },
    
    pause() {
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.pause();
            this.isPlaying = false;
            this.updatePlayButton();
        }
    },
    
    updatePlayButton() {
        const playBtn = document.getElementById('play-button');
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying 
                ? '<i class="fas fa-pause"></i>' 
                : '<i class="fas fa-play"></i>';
        }
    }
};

// Application State Management Class
class AppState {
    constructor() {
        this.currentSong = null;
        this.playlist = [];
        this.queue = [];
        this.isPlaying = false;
        this.volume = 1.0;
        this.currentTime = 0;
        this.duration = 0;
        this.favorites = new Set();
        this.settings = {
            autoplay: true,
            shuffle: false,
            repeat: 'none'
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('mytunes-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('mytunes-settings', JSON.stringify(this.settings));
    }
    
    setupEventListeners() {
        // Audio element event listeners
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.addEventListener('timeupdate', () => {
                this.currentTime = audio.currentTime;
                this.updateProgress();
            });
            
            audio.addEventListener('loadedmetadata', () => {
                this.duration = audio.duration;
            });
            
            audio.addEventListener('ended', () => {
                this.handleTrackEnd();
            });
        }
    }
    
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar && this.duration > 0) {
            const percent = (this.currentTime / this.duration) * 100;
            progressBar.style.width = percent + '%';
        }
    }
    
    handleTrackEnd() {
        if (this.settings.repeat === 'one') {
            this.replay();
        } else if (this.queue.length > 0 || this.settings.repeat === 'all') {
            this.next();
        }
    }
    
    replay() {
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    }
    
    next() {
        // Implementation for next track
        if (this.queue.length > 0) {
            const nextTrack = this.queue.shift();
            this.playSong(nextTrack);
        }
    }
    
    async playSong(songData) {
        this.currentSong = songData;
        await musicPlayer.loadTrack(songData);
        await musicPlayer.play();
    }
}

// Global application state instance
const appState = new AppState();

// Touch event handlers for mobile
function touchStart(event) {
    const touch = event.touches[0];
    return {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
    };
}

function touchEnd(event, startTouch) {
    const touch = event.changedTouches[0];
    const endTouch = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
    };
    
    const deltaX = endTouch.x - startTouch.x;
    const deltaY = endTouch.y - startTouch.y;
    const deltaTime = endTouch.time - startTouch.time;
    
    // Detect swipe gestures
    if (Math.abs(deltaX) > 50 && deltaTime < 300) {
        if (deltaX > 0) {
            // Swipe right - previous track
            appState.previous();
        } else {
            // Swipe left - next track
            appState.next();
        }
    }
}

// Animation frame helper
function frame(callback) {
    requestAnimationFrame(callback);
}

// Additional objects and functionality...
const player = { /* Player implementation */ };
const controls = { /* Controls implementation */ };
const ui = { /* UI management */ };
const playlists = { /* Playlist management */ };
const notifications = { /* Notification system */ };

// Action grid items configuration
const ACTION_GRID_ITEMS = [
    { id: 'play-next', icon: 'play', label: 'Play Next' },
    { id: 'add-queue', icon: 'plus', label: 'Add to Queue' },
    { id: 'add-playlist', icon: 'list', label: 'Add to Playlist' },
    { id: 'favorite', icon: 'heart', label: 'Favorite' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('MyTunes application initialized');
    console.log('Total lines of code: 5,493');
    console.log('Objects: 18, Functions: 50, Properties: 15');
});

/* End of mock global.js file */`;

        return mockCode;
    }

    renderSourceCodeWithIndicators(sourceCode) {
        const lines = sourceCode.split('\n');
        const lineNumbersContainer = document.getElementById('line-numbers');
        const sourceCodeContainer = document.getElementById('source-code-content');
        
        // Generate line numbers
        const lineNumbers = lines.map((_, index) => 
            `<div class="line-number">${index + 1}</div>`
        ).join('');
        lineNumbersContainer.innerHTML = lineNumbers;
        
        // Process source code with syntax highlighting and indicators
        const processedLines = lines.map((line, index) => {
            const lineNumber = index + 1;
            const hasDocumentation = this.lineHasDocumentation(line, lineNumber);
            const indicatorClass = hasDocumentation ? 'has-documentation' : '';
            
            return `<span class="source-line ${indicatorClass}" data-line="${lineNumber}">
                ${this.highlightSyntax(line)}
                ${hasDocumentation ? `<div class="code-indicator" data-line="${lineNumber}" onclick="window.docsAppInstance.showCodeExplanation(${lineNumber}, '${this.escapeForAttribute(line)}')"></div>` : ''}
            </span>`;
        }).join('\n');
        
        sourceCodeContainer.innerHTML = processedLines;
        
        // Setup event listeners for controls
        this.setupSourceCodeControls();
    }

    lineHasDocumentation(line, lineNumber) {
        // Check if this line contains a documented function, class, object, or constant
        const trimmedLine = line.trim();
        
        // Check for function declarations
        if (trimmedLine.match(/^(function\s+\w+|const\s+\w+\s*=\s*function|const\s+\w+\s*=\s*\([^)]*\)\s*=>)/)) {
            const functionName = this.extractFunctionName(trimmedLine);
            return this.isDocumented(functionName);
        }
        
        // Check for class declarations
        if (trimmedLine.match(/^class\s+\w+/)) {
            const className = this.extractClassName(trimmedLine);
            return this.isDocumented(className);
        }
        
        // Check for object declarations
        if (trimmedLine.match(/^const\s+\w+\s*=\s*{/)) {
            const objectName = this.extractObjectName(trimmedLine);
            return this.isDocumented(objectName);
        }
        
        // Check for constant declarations
        if (trimmedLine.match(/^const\s+[A-Z_][A-Z0-9_]*\s*=/)) {
            const constantName = this.extractConstantName(trimmedLine);
            return this.isDocumented(constantName);
        }
        
        return false;
    }

    extractFunctionName(line) {
        const matches = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=)/);
        return matches ? (matches[1] || matches[2]) : null;
    }

    extractClassName(line) {
        const matches = line.match(/class\s+(\w+)/);
        return matches ? matches[1] : null;
    }

    extractObjectName(line) {
        const matches = line.match(/const\s+(\w+)\s*=/);
        return matches ? matches[1] : null;
    }

    extractConstantName(line) {
        const matches = line.match(/const\s+([A-Z_][A-Z0-9_]*)\s*=/);
        return matches ? matches[1] : null;
    }

    isDocumented(name) {
        return name && this.codeStructure.hasOwnProperty(name);
    }

    highlightSyntax(line) {
        // Simple syntax highlighting (can be enhanced with a proper library)
        return line
            .replace(/\b(function|const|let|var|class|if|else|for|while|return|import|export|async|await)\b/g, '<span class="token keyword">$1</span>')
            .replace(/'([^']*)'|"([^"]*)"/g, '<span class="token string">\'$1$2\'</span>')
            .replace(/\b(\d+)\b/g, '<span class="token number">$1</span>')
            .replace(/\/\/.*$/g, '<span class="token comment">$&</span>')
            .replace(/\/\*[\s\S]*?\*\//g, '<span class="token comment">$&</span>')
            .replace(/([{}();,])/g, '<span class="token punctuation">$1</span>');
    }

    showCodeExplanation(lineNumber, lineContent) {
        const elementName = this.extractElementNameFromLine(lineContent);
        const documentation = this.codeStructure[elementName];
        
        if (!documentation) return;
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'code-tooltip';
        tooltip.innerHTML = `
            <div class="code-tooltip-title">${elementName}</div>
            <div class="code-tooltip-description">${documentation.description}</div>
            <button class="code-tooltip-nav" onclick="window.docsAppInstance.navigateToDocumentation('${elementName}')">
                View Full Documentation
            </button>
        `;
        
        // Position tooltip near the clicked indicator
        const indicator = document.querySelector(`[data-line="${lineNumber}"] .code-indicator`);
        if (indicator) {
            const rect = indicator.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.left = (rect.left - 250) + 'px';
            tooltip.style.top = (rect.top - 10) + 'px';
            
            document.body.appendChild(tooltip);
            
            // Remove tooltip after 5 seconds or on click outside
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 5000);
            
            // Remove on click outside
            document.addEventListener('click', function removeTooltip(e) {
                if (!tooltip.contains(e.target) && e.target !== indicator) {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                    document.removeEventListener('click', removeTooltip);
                }
            });
        }
    }

    extractElementNameFromLine(line) {
        // Extract the main element name from a line of code
        const trimmedLine = line.trim();
        
        if (trimmedLine.match(/^function\s+\w+/)) {
            return this.extractFunctionName(trimmedLine);
        }
        if (trimmedLine.match(/^class\s+\w+/)) {
            return this.extractClassName(trimmedLine);
        }
        if (trimmedLine.match(/^const\s+\w+\s*=/)) {
            return this.extractObjectName(trimmedLine);
        }
        
        return null;
    }

    navigateToDocumentation(elementName) {
        // Remove any existing tooltips
        document.querySelectorAll('.code-tooltip').forEach(tooltip => {
            tooltip.parentNode.removeChild(tooltip);
        });
        
        // Navigate to API reference and show the specific element
        this.showSection('api-reference');
        setTimeout(() => {
            this.showItemDetails(elementName, this.codeStructure[elementName]);
        }, 100);
    }

    setupSourceCodeControls() {
        const toggleIndicatorsBtn = document.getElementById('toggle-indicators');
        const collapseAllBtn = document.getElementById('collapse-all');
        const expandAllBtn = document.getElementById('expand-all');
        
        if (toggleIndicatorsBtn) {
            toggleIndicatorsBtn.addEventListener('click', () => {
                const indicators = document.querySelectorAll('.code-indicator');
                const isVisible = indicators[0]?.style.opacity !== '0';
                
                indicators.forEach(indicator => {
                    indicator.style.opacity = isVisible ? '0' : '';
                });
                
                this.showToast(isVisible ? 'Indicators hidden' : 'Indicators shown', 'info');
            });
        }
        
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                // Future feature: collapse code blocks
                this.showToast('Collapse functionality coming soon', 'info');
            });
        }
        
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => {
                // Future feature: expand code blocks
                this.showToast('Expand functionality coming soon', 'info');
            });
        }
    }

    copySourceCode() {
        const sourceCode = document.getElementById('source-code-content').textContent;
        navigator.clipboard.writeText(sourceCode).then(() => {
            this.showToast('Source code copied to clipboard', 'success');
        });
    }

    downloadSource() {
        const sourceCode = document.getElementById('source-code-content').textContent;
        const blob = new Blob([sourceCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'global.js';
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Source code download started', 'success');
    }

    escapeForAttribute(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
}

// Initialize the documentation app
document.addEventListener('DOMContentLoaded', () => {
    try {
        new DocsApp();
    } catch (error) {
        console.error('Failed to create DocsApp:', error);
        
        // Show fallback error message
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="text-center">
                    <div class="text-red-500 text-4xl mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 class="text-xl font-bold mb-4">Failed to Load Documentation</h2>
                    <p class="text-slate-400 mb-6">There was an error initializing the documentation. Please check the console for details.</p>
                    <button onclick="location.reload()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
                        <i class="fas fa-redo mr-2"></i>Reload Page
                    </button>
                </div>
            `;
        }
    }
});


// Initialize Preline UI components
window.addEventListener('load', () => {
    if (window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
    }
});                                            





// Advanced Features and Enhancements for Documentation

class AdvancedFeatures {
    constructor(docsApp) {
        this.docsApp = docsApp;
        this.init();
    }

    init() {
        this.setupAdvancedSearch();
        this.setupCodePlayground();
        this.setupExportFeatures();
        this.setupCollaborativeFeatures();
        this.setupAnalytics();
        this.setupKeyboardShortcuts();
        this.setupContextMenu();
    }

    setupAdvancedSearch() {
        // Enhanced search with fuzzy matching and categories
        this.searchEngine = new FuzzySearch();
        
        const searchInput = document.getElementById('global-search');
        const searchResults = document.createElement('div');
        searchResults.className = 'absolute top-full left-0 right-0 bg-slate-800 border border-slate-600 rounded-lg mt-1 hidden z-50 max-h-96 overflow-y-auto';
        searchInput.parentElement.appendChild(searchResults);

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performAdvancedSearch(e.target.value, searchResults);
            }, 300);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.parentElement.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }

    performAdvancedSearch(query, resultsContainer) {
        if (query.length < 2) {
            resultsContainer.classList.add('hidden');
            return;
        }

        const results = this.searchEngine.search(query, this.docsApp.searchIndex);
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="p-4 text-center text-slate-400">
                    <i class="fas fa-search text-2xl mb-2"></i>
                    <p>No results found</p>
                    <p class="text-xs">Try different keywords or check spelling</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="p-2">
                    <div class="text-xs text-slate-400 mb-2">${results.length} result${results.length !== 1 ? 's' : ''}</div>
                    ${results.map((result, index) => `
                        <div class="search-result-item p-3 hover:bg-slate-700 rounded cursor-pointer" data-path="${result.path}" data-index="${index}">
                            <div class="flex items-center justify-between mb-1">
                                <span class="font-medium">${this.highlightText(result.name, query)}</span>
                                <span class="method-badge method-${result.type} text-xs">${result.type}</span>
                            </div>
                            <div class="text-xs text-slate-400">${result.path}</div>
                            <div class="text-xs text-slate-500 mt-1">${this.highlightText(result.description, query)}</div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Bind click events
            resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.docsApp.navigateToItem(item.dataset.path);
                    resultsContainer.classList.add('hidden');
                    document.getElementById('global-search').value = '';
                });
            });
        }

        resultsContainer.classList.remove('hidden');
    }

    highlightText(text, query) {
        if (!text || !query) return text;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    setupCodePlayground() {
        // Interactive code playground
        this.createPlaygroundModal();
        this.addPlaygroundButtons();
    }

    createPlaygroundModal() {
        const modal = document.createElement('div');
        modal.id = 'playground-modal';
        modal.className = 'hs-overlay hidden w-full h-full fixed top-0 start-0 z-[90] overflow-hidden';
        
        modal.innerHTML = `
            <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all w-full h-full">
                <div class="bg-slate-900 w-full h-full flex flex-col">
                    <div class="flex justify-between items-center p-4 border-b border-slate-700">
                        <h3 class="font-bold text-slate-200">Code Playground</h3>
                        <div class="flex items-center space-x-2">
                            <button id="run-code" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <i class="fas fa-play mr-2"></i>Run
                            </button>
                            <button id="reset-playground" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <i class="fas fa-undo mr-2"></i>Reset
                            </button>
                            <button type="button" class="hs-overlay-toggle text-slate-400 hover:text-slate-200" data-hs-overlay="#playground-modal">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex-1 flex">
                        <div class="w-1/2 border-r border-slate-700">
                            <div class="p-4 border-b border-slate-700 bg-slate-800">
                                <h4 class="font-semibold">Code Editor</h4>
                            </div>
                            <div class="h-full">
                                <textarea id="playground-editor" class="w-full h-full bg-slate-800 text-slate-100 p-4 font-mono text-sm resize-none border-0 outline-none" placeholder="// Write your code here..."></textarea>
                            </div>
                        </div>
                        <div class="w-1/2">
                            <div class="p-4 border-b border-slate-700 bg-slate-800">
                                <h4 class="font-semibold">Output</h4>
                            </div>
                            <div id="playground-output" class="h-full bg-slate-900 p-4 font-mono text-sm overflow-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.bindPlaygroundEvents();
    }

    bindPlaygroundEvents() {
        document.getElementById('run-code').addEventListener('click', () => {
            this.executePlaygroundCode();
        });

        document.getElementById('reset-playground').addEventListener('click', () => {
            document.getElementById('playground-editor').value = '';
            document.getElementById('playground-output').innerHTML = '';
        });
    }

    executePlaygroundCode() {
        const code = document.getElementById('playground-editor').value;
        const output = document.getElementById('playground-output');
        
        // Clear previous output
        output.innerHTML = '';
        
        // Create a safe execution environment
        const originalConsole = console.log;
        const logs = [];
        
        console.log = (...args) => {
            logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        };
        
        try {
            // Execute the code
            const result = new Function(`
                ${this.getPlaygroundContext()}
                ${code}
            `)();
            
            if (result !== undefined) {
                logs.push(`Return value: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`);
            }
            
            output.innerHTML = logs.map(log => `<div class="mb-2 text-green-400">${this.escapeHtml(log)}</div>`).join('');
            
        } catch (error) {
            output.innerHTML = `<div class="text-red-400">Error: ${this.escapeHtml(error.message)}</div>`;
        } finally {
            console.log = originalConsole;
        }
    }

    getPlaygroundContext() {
        return `
            // Mock MyTunes API for playground
            const mockSong = {
                id: "demo-song",
                title: "Demo Song",
                artist: "Demo Artist",
                album: "Demo Album",
                duration: "3:45"
            };
            
            const utils = {
                formatTime: (seconds) => {
                    const minutes = Math.floor(seconds / 60);
                    const secs = Math.floor(seconds % 60);
                    return \`\${minutes}:\${secs.toString().padStart(2, "0")}\`;
                },
                normalizeForUrl: (text) => {
                    return text.toLowerCase().replace(/[^\\w\\s]/g, "").replace(/\\s+/g, "");
                }
            };
            
            const notifications = {
                show: (message, type = 'info') => {
                    console.log(\`Notification (\${type}): \${message}\`);
                }
            };
            
            const player = {
                playSong: (songData) => {
                    console.log('Playing:', songData.title, 'by', songData.artist);
                    return Promise.resolve();
                }
            };
        `;
    }

    addPlaygroundButtons() {
        // Add playground buttons to code blocks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.code-block')) {
                const codeBlock = e.target.closest('.code-block');
                if (!codeBlock.querySelector('.playground-btn')) {
                    const btn = document.createElement('button');
                    btn.className = 'playground-btn absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors';
                    btn.innerHTML = '<i class="fas fa-play mr-1"></i>Try it';
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const code = codeBlock.querySelector('code').textContent;
                        this.openPlaygroundWithCode(code);
                    });
                    codeBlock.style.position = 'relative';
                    codeBlock.appendChild(btn);
                }
            }
        });
    }

    openPlaygroundWithCode(code) {
        document.getElementById('playground-editor').value = code;
        HSOverlay.open(document.getElementById('playground-modal'));
    }

    setupExportFeatures() {
        this.addExportMenu();
    }

    addExportMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const menu = menuToggle.nextElementSibling;
        
        menu.innerHTML += `
            <div class="border-t border-slate-600 my-2"></div>
            <a href="#" id="export-pdf" class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-700">
                <i class="fas fa-file-pdf"></i>
                Export as PDF
            </a>
            <a href="#" id="export-html" class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-700">
                <i class="fas fa-code"></i>
                Export as HTML
            </a>
            <a href="#" id="generate-summary" class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-700">
                <i class="fas fa-file-alt"></i>
                Generate Summary
            </a>
        `;

        document.getElementById('export-pdf').addEventListener('click', (e) => {
            e.preventDefault();
            this.exportAsPDF();
        });

        document.getElementById('export-html').addEventListener('click', (e) => {
            e.preventDefault();
            this.exportAsHTML();
        });

        document.getElementById('generate-summary').addEventListener('click', (e) => {
            e.preventDefault();
            this.generateSummary();
        });
    }

    exportAsPDF() {
        // Create printable version
        const printWindow = window.open('', '_blank');
        const content = this.generatePrintableContent();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>MyTunes Documentation</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    h2 { color: #555; margin-top: 30px; }
                    .code-block { background: #f5f5f5; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .method-badge { background: #e0e0e0; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    }

    exportAsHTML() {
        const content = this.generateExportableHTML();
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mytunes-documentation.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.docsApp.showToast('Documentation exported as HTML', 'success');
    }

    generateSummary() {
        const summary = this.createDocumentationSummary();
        this.showSummaryModal(summary);
    }

    createDocumentationSummary() {
        const stats = {
            totalObjects: 0,
            totalFunctions: 0,
            totalProperties: 0,
            complexity: 'High',
            mainFeatures: []
        };

        this.docsApp.searchIndex.forEach(item => {
            if (item.type === 'object' || item.type === 'class') stats.totalObjects++;
            else if (item.type.includes('function')) stats.totalFunctions++;
            else stats.totalProperties++;
        });

        stats.mainFeatures = Object.keys(this.docsApp.codeStructure).slice(0, 5);

        return {
            overview: 'MyTunes is a comprehensive music player application with advanced features including playlist management, theme switching, and real-time notifications.',
            stats,
            recommendations: [
                'Start with the player object for basic functionality',
                'Use utils for common operations',
                'Implement notifications for user feedback',
                'Consider the storage system for data persistence'
            ]
        };
    }

    showSummaryModal(summary) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Documentation Summary</h3>
                    <button class="text-slate-400 hover:text-slate-200 close-summary">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <h4 class="font-semibold mb-2">Overview</h4>
                        <p class="text-slate-400">${summary.overview}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-2">Statistics</h4>
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div class="bg-slate-700 rounded-lg p-3">
                                <div class="text-2xl font-bold text-blue-400">${summary.stats.totalObjects}</div>
                                <div class="text-xs text-slate-400">Objects</div>
                            </div>
                            <div class="bg-slate-700 rounded-lg p-3">
                                <div class="text-2xl font-bold text-green-400">${summary.stats.totalFunctions}</div>
                                <div class="text-xs text-slate-400">Functions</div>
                            </div>
                            <div class="bg-slate-700 rounded-lg p-3">
                                <div class="text-2xl font-bold text-purple-400">${summary.stats.totalProperties}</div>
                                <div class="text-xs text-slate-400">Properties</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-2">Key Features</h4>
                        <div class="flex flex-wrap gap-2">
                            ${summary.stats.mainFeatures.map(feature => 
                                `<span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">${feature}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-2">Recommendations</h4>
                        <ul class="space-y-1 text-slate-400">
                            ${summary.recommendations.map(rec => `<li>• ${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.close-summary').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.body.appendChild(modal);
    }

    setupKeyboardShortcuts() {
        const shortcuts = {
            'ctrl+k': () => document.getElementById('global-search').focus(),
            'ctrl+p': () => this.openPlaygroundWithCode('// Start coding here...'),
            'ctrl+e': () => this.exportAsHTML(),
            'ctrl+/': () => this.showShortcutsHelp(),
            'escape': () => this.closeAllModals()
        };

        document.addEventListener('keydown', (e) => {
            const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.key.toLowerCase()}`;
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });
    }

    showShortcutsHelp() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4">Keyboard Shortcuts</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span>Search</span>
                        <kbd class="bg-slate-700 px-2 py-1 rounded text-sm">Ctrl + K</kbd>
                    </div>
                    <div class="flex justify-between">
                        <span>Playground</span>
                        <kbd class="bg-slate-700 px-2 py-1 rounded text-sm">Ctrl + P</kbd>
                    </div>
                    <div class="flex justify-between">
                        <span>Export</span>
                        <kbd class="bg-slate-700 px-2 py-1 rounded text-sm">Ctrl + E</kbd>
                    </div>
                    <div class="flex justify-between">
                        <span>Help</span>
                        <kbd class="bg-slate-700 px-2 py-1 rounded text-sm">Ctrl + /</kbd>
                    </div>
                    <div class="flex justify-between">
                        <span>Close</span>
                        <kbd class="bg-slate-700 px-2 py-1 rounded text-sm">Escape</kbd>
                    </div>
                </div>
                <button class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors close-shortcuts">
                    Got it!
                </button>
            </div>
        `;

        modal.querySelector('.close-shortcuts').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.body.appendChild(modal);
    }

    closeAllModals() {
        document.querySelectorAll('.hs-overlay').forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                HSOverlay.close(modal);
            }
        });
    }

    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.code-block')) {
                e.preventDefault();
                this.showCodeContextMenu(e, e.target.closest('.code-block'));
            }
        });
    }

    showCodeContextMenu(event, codeBlock) {
        // Remove existing context menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'context-menu fixed bg-slate-800 border border-slate-600 rounded-lg shadow-lg py-2 z-50';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;

        menu.innerHTML = `
            <button class="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm" data-action="copy">
                <i class="fas fa-copy mr-2"></i>Copy Code
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm" data-action="playground">
                <i class="fas fa-play mr-2"></i>Try in Playground
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm" data-action="explain">
                <i class="fas fa-question-circle mr-2"></i>Explain Code
            </button>
        `;

        menu.addEventListener('click', (e) => {
            const action = e.target.closest('button')?.dataset.action;
            const code = codeBlock.querySelector('code').textContent;
            
            switch (action) {
                case 'copy':
                    navigator.clipboard.writeText(code);
                    this.docsApp.showToast('Code copied!', 'success');
                    break;
                case 'playground':
                    this.openPlaygroundWithCode(code);
                    break;
                case 'explain':
                    this.explainCode(code);
                    break;
            }
            
            menu.remove();
        });

        document.addEventListener('click', () => menu.remove(), { once: true });
        document.body.appendChild(menu);
    }

    explainCode(code) {
        // Simple code explanation (could be enhanced with AI)
        const explanations = {
            'async': 'This is an asynchronous function that can use await',
            'const': 'This declares a constant variable',
            'let': 'This declares a variable with block scope',
            'function': 'This defines a function',
            'class': 'This defines a class',
            'addEventListener': 'This adds an event listener to an element',
            'querySelector': 'This selects an element from the DOM'
        };

        let explanation = 'Code Analysis:\n\n';
        Object.entries(explanations).forEach(([keyword, desc]) => {
            if (code.includes(keyword)) {
                explanation += `• ${keyword}: ${desc}\n`;
            }
        });

        alert(explanation || 'No specific explanations available for this code.');
    }

    setupAnalytics() {
        this.analytics = {
            pageViews: {},
            searchQueries: [],
            codeExecutions: 0
        };

        // Track page views
        this.trackEvent('page_view', { page: 'documentation_home' });
    }

    trackEvent(eventName, data) {
        console.log(`Analytics: ${eventName}`, data);
        // In a real implementation, this would send to analytics service
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generatePrintableContent() {
        // Generate content suitable for printing
        let content = '<h1>MyTunes Documentation</h1>';
        
        Object.entries(this.docsApp.codeStructure).forEach(([name, item]) => {
            content += `
                <h2>${name}</h2>
                <p><strong>Type:</strong> ${item.type}</p>
                <p>${item.description || 'No description available'}</p>
            `;
            
            if (item.methods) {
                content += '<h3>Methods</h3>';
                Object.entries(item.methods).forEach(([methodName, method]) => {
                    content += `<p><strong>${methodName}:</strong> ${method.description || 'No description'}</p>`;
                });
            }
        });
        
        return content;
    }

    generateExportableHTML() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>MyTunes Documentation Export</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 40px; }
                    h1, h2, h3 { color: #2d3748; }
                    .code-block { background: #f7fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 15px 0; overflow-x: auto; }
                    .method-badge { background: #edf2f7; color: #4a5568; padding: 4px 8px; border-radius: 12px; font-size: 12px; display: inline-block; margin-left: 8px; }
                    pre { background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; }
                    code { font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; }
                </style>
            </head>
            <body>
                ${this.generatePrintableContent()}
                <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
                    Generated on ${new Date().toLocaleDateString()}
                </footer>
            </body>
            </html>
        `;
    }
}

// Fuzzy Search Implementation
class FuzzySearch {
    search(query, items) {
        if (!query || !items) return [];
        
        const results = items.map(item => ({
            ...item,
            score: this.calculateScore(query.toLowerCase(), item.keywords)
        })).filter(item => item.score > 0);
        
        return results.sort((a, b) => b.score - a.score);
    }
    
    calculateScore(query, text) {
        if (!text.includes(query)) {
            // Check for partial matches
            const queryChars = query.split('');
            let matchCount = 0;
            let lastIndex = -1;
            
            for (const char of queryChars) {
                const index = text.indexOf(char, lastIndex + 1);
                if (index > lastIndex) {
                    matchCount++;
                    lastIndex = index;
                }
            }
            
            return matchCount / query.length * 0.5; // Partial match score
        }
        
        // Exact match bonus
        if (text.startsWith(query)) return 1.0;
        
        // Contains query
        return 0.8;
    }
}

// Initialize advanced features when DocsApp is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for DocsApp to be initialized
    setTimeout(() => {
        if (window.docsAppInstance) {
            new AdvancedFeatures(window.docsAppInstance);
        }
    }, 1000);
});