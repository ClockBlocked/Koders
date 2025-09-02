// ============================================================================
// MYTUNESAPP DIAGNOSTIC SCRIPT
// ============================================================================
// Paste this into your browser console to analyze the music app
// Author: Assistant | Date: 2025-09-02 | User: ClockBlocked
// ============================================================================

(function() {
    'use strict';
    
    console.clear();
    console.log('Diagnostic Starting...\n');
    
    const diagnostics = {
        results: {
            critical: [],
            warnings: [],
            missing: [],
            placeholders: [],
            suggestions: [],
            passed: []
        },
        
        // Helper functions
        log: function(type, message, details = null) {
            this.results[type].push({ message, details, timestamp: new Date().toISOString() });
        },
        
        checkElement: function(id, description) {
            const element = document.getElementById(id);
            if (!element) {
                this.log('critical', `Missing DOM element: ${id}`, { description, expected: `#${id}` });
                return false;
            }
            this.log('passed', `DOM element found: ${id}`, { description });
            return element;
        },
        
        checkFunction: function(obj, path, description) {
            const func = this.getNestedProperty(obj, path);
            if (typeof func !== 'function') {
                this.log('missing', `Missing function: ${path}`, { description, type: typeof func });
                return false;
            }
            this.log('passed', `Function exists: ${path}`, { description });
            return func;
        },
        
        checkProperty: function(obj, path, description, expectedType = null) {
            const prop = this.getNestedProperty(obj, path);
            if (prop === undefined || prop === null) {
                this.log('missing', `Missing property: ${path}`, { description, expected: expectedType });
                return false;
            }
            if (expectedType && typeof prop !== expectedType) {
                this.log('warnings', `Property type mismatch: ${path}`, { 
                    description, 
                    expected: expectedType, 
                    actual: typeof prop 
                });
            }
            this.log('passed', `Property exists: ${path}`, { description, type: typeof prop });
            return prop;
        },
        
        getNestedProperty: function(obj, path) {
            return path.split('.').reduce((current, key) => current && current[key], obj);
        },
        
        checkPlaceholder: function(func, funcName, keywords = ['coming soon', 'todo', 'placeholder', 'not implemented']) {
            if (typeof func === 'function') {
                const funcString = func.toString().toLowerCase();
                const foundKeywords = keywords.filter(keyword => funcString.includes(keyword));
                if (foundKeywords.length > 0) {
                    this.log('placeholders', `Placeholder function detected: ${funcName}`, { 
                        keywords: foundKeywords,
                        function: func.toString().substring(0, 200) + '...'
                    });
                    return true;
                }
            }
            return false;
        }
    };
    
    // ============================================================================
    // CORE DEPENDENCIES CHECK
    // ============================================================================
    
    console.log('🔍 Checking Core Dependencies...');
    
    // Check if music library is loaded
    if (!window.music) {
        diagnostics.log('critical', 'Music library not loaded', { 
            expected: 'window.music array',
            suggestion: 'Ensure music module is imported and loaded before app initialization'
        });
    } else if (!Array.isArray(window.music)) {
        diagnostics.log('critical', 'Music library is not an array', { 
            actual: typeof window.music,
            expected: 'array'
        });
    } else if (window.music.length === 0) {
        diagnostics.log('warnings', 'Music library is empty', {
            suggestion: 'Load music data to test player functionality'
        });
    } else {
        diagnostics.log('passed', `Music library loaded with ${window.music.length} artists`);
        
        // Check music data structure
        const firstArtist = window.music[0];
        if (!firstArtist.artist) diagnostics.log('warnings', 'Artist missing "artist" property');
        if (!firstArtist.albums || !Array.isArray(firstArtist.albums)) {
            diagnostics.log('warnings', 'Artist missing "albums" array');
        } else if (firstArtist.albums.length > 0) {
            const firstAlbum = firstArtist.albums[0];
            if (!firstAlbum.album) diagnostics.log('warnings', 'Album missing "album" property');
            if (!firstAlbum.songs || !Array.isArray(firstAlbum.songs)) {
                diagnostics.log('warnings', 'Album missing "songs" array');
            } else if (firstAlbum.songs.length > 0) {
                const firstSong = firstAlbum.songs[0];
                const requiredSongProps = ['id', 'title'];
                requiredSongProps.forEach(prop => {
                    if (!firstSong[prop]) {
                        diagnostics.log('warnings', `Song missing "${prop}" property`);
                    }
                });
            }
        }
    }
    
    // Check render functions
    if (!window.render) {
        diagnostics.log('critical', 'Render module not loaded', {
            expected: 'window.render object with template functions'
        });
    }
    
    // Check if app is initialized
    if (!window.appState && !window.MyTunesApp) {
        diagnostics.log('critical', 'App not initialized', {
            suggestion: 'Call MyTunesApp.initialize() or check initialization errors'
        });
    }
    
    // ============================================================================
    // DOM ELEMENTS CHECK
    // ============================================================================
    
    console.log('🔍 Checking Required DOM Elements...');
    
    const requiredElements = {
/*********************************************************
**********************************************************
REPLACE WITH SOME OR ALL OR WHICHEVER ELEMENTS OF YOURS
**********************************************************
*********************************************************/

      
        // Navigation & Menu
        'now-playing-area': 'Main now playing display area',
        'theme-toggle': 'Theme toggle button',
        'menu-trigger': 'Dropdown menu trigger',
        'dropdown-menu': 'Dropdown menu container',
        
        // Player Controls
        'play-pause-navbar': 'Navbar play/pause button',
        'prev-btn-navbar': 'Navbar previous button',
        'next-btn-navbar': 'Navbar next button',
        'play-icon-navbar': 'Navbar play icon',
        'pause-icon-navbar': 'Navbar pause icon',
        
        // Now Playing Info
        'navbar-album-cover': 'Navbar album cover image',
        'navbar-artist': 'Navbar artist name',
        'navbar-song-title': 'Navbar song title',
        
        // Music Player Popup
        'musicPlayer': 'Music player popup container',
        'popup-album-cover': 'Popup album cover',
        'popup-song-title': 'Popup song title',
        'popup-artist-name': 'Popup artist name',
        'popup-progress-bar': 'Popup progress bar',
        'popup-play-pause-btn': 'Popup play/pause button',
        'popup-favorite-btn': 'Popup favorite button',
        
        // Content Areas
        'dynamic-content': 'Main dynamic content area',
        'queue-list': 'Queue list container',
        'recent-list': 'Recently played list container'
/***********************************************************************
************************************************************************/          
    };



  
    Object.entries(requiredElements).forEach(([id, description]) => {
        diagnostics.checkElement(id, description);
    });



  
// ============================================================================
// JAVASCRIPT API CHECK
// ============================================================================
    console.log('🔍 Checking JavaScript APIs...');
    
    const appState = window.appState;
    if (appState) { // Global app state
        const stateProps = { // State properties
            'audio': 'Audio element instance',
            'currentSong': 'Currently playing song object',
            'isPlaying': 'Playing state boolean',
            'queue': 'Queue management object',
            'favorites': 'Favorites management object'
        };
        
        Object.entries(stateProps).forEach(([prop, description]) => {
            diagnostics.checkProperty(appState, prop, description);
        });
        
        if (appState.queue) { // Nested objects
            const queueMethods = ['add', 'remove', 'clear', 'getNext', 'playAt'];
            queueMethods.forEach(method => {
                diagnostics.checkFunction(appState.queue, method, `Queue ${method} method`);
            });
        }
        
        if (appState.favorites) {
            const favoritesMethods = ['add', 'remove', 'toggle', 'has'];
            favoritesMethods.forEach(method => {
                diagnostics.checkFunction(appState.favorites, method, `Favorites ${method} method`);
            });
        }
    }
    
    const playerAPI = window.musicAppAPI?.player;
    if (playerAPI) { // Player API
        const playerMethods = {
            'playSong': 'Play a specific song',
            'play': 'Resume playback',
            'pause': 'Pause playback',
            'toggle': 'Toggle play/pause',
            'next': 'Play next song',
            'previous': 'Play previous song',
            'seekTo': 'Seek to specific time'
        };
        
        Object.entries(playerMethods).forEach(([method, description]) => {
            diagnostics.checkFunction(playerAPI, method, description);
        });
    } else {
        diagnostics.log('critical', 'Player API not available', {
            expected: 'window.musicAppAPI.player object'
        });
    }



  
// ============================================================================
// AUDIO FUNCTIONALITY CHECK
// ============================================================================
    console.log('🔍 Checking Audio Functionality...');
    
    if (appState?.audio) {
        const audio = appState.audio;
        
        if (!(audio instanceof Audio)) { // Audio Element
            diagnostics.log('critical', 'Audio element is not an Audio instance', {
                actual: typeof audio
            });
        } else {
            diagnostics.log('passed', 'Audio element is properly configured');
            
            const requiredEvents = ['timeupdate', 'ended', 'loadedmetadata', 'play', 'pause', 'error'];
            // Note: Can't easily check event listeners, but we can check if they're likely bound
            if (audio.currentTime !== undefined) {
                diagnostics.log('passed', 'Audio element appears functional');
            }
        }
    } else {
        diagnostics.log('critical', 'No audio element found in app state');
    }
    
    if ('mediaSession' in navigator) { // Android Media Session Support
        diagnostics.log('passed', 'MediaSession API supported');
        
        if (navigator.mediaSession.metadata) { // MetaData
            diagnostics.log('passed', 'MediaSession metadata is set', {
                title: navigator.mediaSession.metadata.title
            });
        } else {
            diagnostics.log('warnings', 'MediaSession metadata not set');
        }
    } else {
        diagnostics.log('warnings', 'MediaSession API not supported in this browser');
    }



  
// ============================================================================
// UI FUNCTIONALITY CHECK
// ============================================================================   
    console.log('🔍 Checking UI Functionality...');
    
    const uiAPI = window.musicAppAPI?.ui;
    if (uiAPI) {
        const uiMethods = { // UI Update Function / Logic
            'updateNowPlaying': 'Update now playing display',
            'updateNavbar': 'Update navbar information',
            'updatePlayPauseButtons': 'Update play/pause button states',
            'updateCounts': 'Update dropdown counts'
        };
        
        Object.entries(uiMethods).forEach(([method, description]) => {
            diagnostics.checkFunction(uiAPI, method, description);
        });
    }
    
    const themeAPI = window.musicAppAPI?.theme;
    if (themeAPI) { // Site Theme
        diagnostics.checkFunction(themeAPI, 'toggle', 'Theme toggle functionality');
    }
    
    const html = document.documentElement; // Site Theme State
    const themes = ['light', 'medium'];
    const currentTheme = themes.find(theme => html.classList.contains(theme)) || 'dark';
    diagnostics.log('passed', `Current theme: ${currentTheme}`);



  
// ============================================================================
// LOCAL STORAGE CHECK
// ============================================================================ 
    console.log('🔍 Checking Local Storage...');
    
    const storageKeys = {
        'theme-preference': 'Theme preference',
        'favoriteSongs': 'Favorite songs',
        'favoriteArtists': 'Favorite artists',
        'recentlyPlayed': 'Recently played songs',
        'queue': 'Current queue',
        'playlists': 'User playlists'
    };
    
    Object.entries(storageKeys).forEach(([key, description]) => {
        try {
            const value = localStorage.getItem(key);
            if (value) {
                const parsed = JSON.parse(value);
                diagnostics.log('passed', `LocalStorage ${key}`, {
                    description,
                    type: Array.isArray(parsed) ? `array[${parsed.length}]` : typeof parsed
                });
            } else {
                diagnostics.log('warnings', `LocalStorage ${key} empty`, { description });
            }
        } catch (error) {
            diagnostics.log('warnings', `LocalStorage ${key} parse error`, {
                description,
                error: error.message
            });
        }
    });



  
// ============================================================================
// EVENT BINDING CHECK
// ============================================================================
    console.log('🔍 Checking Event Bindings...');
    
    const criticalClickElements = [
    // Click Handlers
        'play-pause-navbar',
        'menu-trigger',
        'now-playing-area',
        'theme-toggle'
    ];
    
    criticalClickElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // More important click handlers
            const hasHandlers = element.onclick || 
                               element.getAttribute('onclick') || 
                               element.classList.contains('clickable') ||
                               element.style.cursor === 'pointer';
            
            if (!hasHandlers) {
                diagnostics.log('warnings', `Element may be missing click handler: ${id}`);
            } else {
                diagnostics.log('passed', `Element appears to have click handler: ${id}`);
            }
        }
    });



  
// ============================================================================
// PLACEHOLDER FUNCTION DETECTION
//============================================================================   
    console.log('🔍 Detecting Placeholder Functions...');
    
    const checkForPlaceholders = (obj, path = '') => {
        if (!obj || typeof obj !== 'object') return;
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof value === 'function') {
                diagnostics.checkPlaceholder(value, currentPath);
            } else if (typeof value === 'object' && value !== null) {
                checkForPlaceholders(value, currentPath);
            }
        });
    };
    
    //Placeholders Detection
    if (window.musicAppAPI) checkForPlaceholders(window.musicAppAPI, 'musicAppAPI');
    if (window.appState) checkForPlaceholders(window.appState, 'appState');



  
// ============================================================================
// PERFORMANCE CHECK
// ============================================================================
    
    console.log('🔍 Checking Performance...');
    
    const audioElements = document.querySelectorAll('audio');
    if (audioElements.length > 1) { // Memory Leaks
        diagnostics.log('warnings', `Multiple audio elements detected: ${audioElements.length}`, {
            suggestion: 'Ensure old audio elements are properly cleaned up'
        });
    }
    
    // Excessive Event Listeners Detection
    const elementsWithManyHandlers = [];
    document.querySelectorAll('*').forEach(el => {
        if (el.getEventListeners) { // Chrome DevTools only
            const listeners = el.getEventListeners();
            const totalListeners = Object.values(listeners).reduce((sum, arr) => sum + arr.length, 0);
            if (totalListeners > 5) {
                elementsWithManyHandlers.push({ element: el.tagName + (el.id ? `#${el.id}` : ''), count: totalListeners });
            }
        }
    });
    
    if (elementsWithManyHandlers.length > 0) {
        diagnostics.log('warnings', 'Elements with many event listeners detected', {
            elements: elementsWithManyHandlers,
            suggestion: 'Consider event delegation to reduce memory usage'
        });
    }



  
// ============================================================================
// VARIOUS ISSUE CHECKS
// ============================================================================  
    console.log('🔍 Checking for Known Issues...');
    
    // Optional Media Session API Check
    try {
        if ('mediaSession' in navigator) {
            const testActions = ['previoustrack', 'nexttrack', 'play', 'pause'];
            testActions.forEach(action => {
                try {
                    navigator.mediaSession.setActionHandler(action, () => {});
                    diagnostics.log('passed', `MediaSession action '${action}' supported`);
                } catch (error) {
                    diagnostics.log('critical', `MediaSession action '${action}' error`, {
                        error: error.message,
                        suggestion: 'Check action name spelling and browser support'
                    });
                }
            });
        }
    } catch (error) {
        diagnostics.log('warnings', 'MediaSession test failed', { error: error.message });
    }
    
    // Common JavaScript Errors
    if (window.onerror || window.addEventListener) {
        // Error Collector
        const originalErrors = [];
        const originalOnError = window.onerror;
        
        window.onerror = function(msg, url, line, col, error) {
            originalErrors.push({ msg, url, line, col, error: error?.message });
            if (originalOnError) return originalOnError.apply(this, arguments);
        };
        
        setTimeout(() => {
            if (originalErrors.length > 0) {
                diagnostics.log('critical', 'JavaScript errors detected', {
                    errors: originalErrors,
                    suggestion: 'Check browser console for detailed error messages'
                });
            }
            window.onerror = originalOnError;
        }, 1000);
    }



  
// ============================================================================
// GENERATE REPORT
// ============================================================================  
    setTimeout(() => {
        console.log('\n Diagnostic Report\n');
        console.log('/'.repeat(80));
        
        const { critical, warnings, missing, placeholders, suggestions, passed } = diagnostics.results;
        
        // Summary
        console.log(`\n📊 SUMMARY:`);
        console.log(`✅ Passed: ${passed.length}`);
        console.log(`⚠️  Warnings: ${warnings.length}`);
        console.log(`❌ Critical: ${critical.length}`);
        console.log(`🔍 Missing: ${missing.length}`);
        console.log(`📝 Placeholders: ${placeholders.length}`);
        
        // Critical Issues
        if (critical.length > 0) {
            console.log(`\n ‼️CRITICAL‼️ ISSUES (Fix immediately):`);
            critical.forEach((issue, i) => {
                console.log(`${i + 1}. ${issue.message}`);
                if (issue.details) console.log(`   Details:`, issue.details);
            });
        }
        
        // Missing Components
        if (missing.length > 0) {
            console.log(`\n🔍 MISSING COMPONENTS:`);
            missing.forEach((issue, i) => {
                console.log(`${i + 1}. ${issue.message}`);
                if (issue.details) console.log(`   Details:`, issue.details);
            });
        }
        
        // Warnings
        if (warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS:`);
            warnings.forEach((issue, i) => {
                console.log(`${i + 1}. ${issue.message}`);
                if (issue.details) console.log(`   Details:`, issue.details);
            });
        }
        
        // Placeholder Functions
        if (placeholders.length > 0) {
            console.log(`\n📝 PLACEHOLDER FUNCTIONS (Need implementation):`);
            placeholders.forEach((issue, i) => {
                console.log(`${i + 1}. ${issue.message}`);
                if (issue.details?.keywords) {
                    console.log(`   Keywords found: ${issue.details.keywords.join(', ')}`);
                }
            });
        }
        
        // Recommendations
        console.log(`\n💡 RECOMMENDATIONS:`);
        
        if (critical.length > 0) {
            console.log(`1. Fix critical issues first - app may not function properly`);
        }
        
        if (missing.length > 0) {
            console.log(`2. Implement missing components for full functionality`);
        }
        
        if (placeholders.length > 0) {
            console.log(`3. Replace placeholder functions with actual implementations`);
        }
        
        console.log(`4. Test audio playback with actual music files`);
        console.log(`5. Test responsive design on different screen sizes`);
        console.log(`6. Verify localStorage persistence across browser sessions`);
        
        // Finished
        if (critical.length === 0 && missing.length < 3) {
            console.log(`\n✅ Your app structure looks good! Focus on implementing placeholder functions.`);
        } else {
            console.log(`\n‼️ Focus on fixing critical issues and missing components first.`);
        }
        
        console.log('\n' + '/'.repeat(30));
        console.log(`Diagnostic completed at ${new Date().toLocaleString()}`);
        console.log(`D E B U G G I N G  |  Total checks: ${Object.values(diagnostics.results).flat().length}`);
        console.log('\n' + '/'.repeat(75));
        console.log('\n'.repeat(4));

        window.diagnosticResults = diagnostics.results;
        console.log(`\n📀 Results saved to window.diagnosticResults`);        
    }, 1500);
    
})();






// ===========================================================================
// ADDITIONAL HELPER FUNCTIONS
// ===========================

// Quick test
window.testMusicApp = {
    playRandomSong: function() {
        if (window.music && window.music.length > 0) {
            const randomArtist = window.music[Math.floor(Math.random() * window.music.length)];
            const randomAlbum = randomArtist.albums[Math.floor(Math.random() * randomArtist.albums.length)];
            const randomSong = randomAlbum.songs[Math.floor(Math.random() * randomAlbum.songs.length)];
            
            const songData = {
                ...randomSong,
                artist: randomArtist.artist,
                album: randomAlbum.album
            };
            
            if (window.musicAppAPI?.player?.playSong) {
                window.musicAppAPI.player.playSong(songData);
                console.log('🎵 Playing random song:', songData.title, 'by', songData.artist);
            } else {
                console.log('❌ Player not available');
            }
        } else {
            console.log('❌ No music library available');
        }
    },
    
    testThemeToggle: function() {
        if (window.musicAppAPI?.theme?.toggle) {
            window.musicAppAPI.theme.toggle();
            console.log('🎨 Theme toggled');
        } else {
            console.log('❌ Theme toggle not available');
        }
    },
    
    testNotification: function() {
        if (window.musicAppAPI?.notifications?.show) {
            window.musicAppAPI.notifications.show('Test notification', 'info');
            console.log('🔔❔ Test notification sent');
        } else {
            console.log('🔕 Notifications not available');
        }
    },
    
    inspectState: function() {
        console.log('Current App State:', window.appState);
        console.log('Available APIs:', Object.keys(window.musicAppAPI || {}));
    }
};

console.log('\n Test functions available:');
console.log('- testMusicApp.playRandomSong()');
console.log('- testMusicApp.testThemeToggle()');
console.log('- testMusicApp.testNotification()');
console.log('- testMusicApp.inspectState()');
