import { music } from '../library.js';
import { render } from './blocks.js';
import { create } from './helpers.js';

let player = {
    audioElement: null,
    currentSong: null,
    currentArtist: null,
    currentAlbum: null,
    isPlaying: false,
    duration: 0,
    queue: [],
    recentlyPlayed: [],
    favorites: new Set(),
    isDragging: false,
    shuffleMode: false,
    repeatMode: "off",
    rewindInterval: 10,
    fastForwardInterval: 30,
    seekTooltip: null
};

let navbar = {
    elements: {},
    playlists: [],
    favoriteArtists: new Set()
};

let nowPlayingPopup = {
    elements: {},
    currentTab: "now-playing",
    isVisible: false,
    inactivityTimer: null
};

let ui = {
    elements: {},
    similarArtistsCarousel: null,
    albumSelector: null,
    notifications: [],
    notificationContainer: null,
    historyOverlay: null,
    historyPanel: null,
    historyBtn: null,
    currentNotificationTimeout: null,
    loadingProgress: 0,
    loadingTimer: null
};

let pageManager = {
    currentPage: "home",
    currentArtist: null,
    currentAlbum: null
};

function initializeMusicLibrary() {
    window.music = music;
}

function initPlayer() {
    if (player.audioElement) return;

    player.audioElement = new Audio();

    player.audioElement.addEventListener('timeupdate', updateProgress);
    player.audioElement.addEventListener('ended', handleSongEnd);
    player.audioElement.addEventListener('loadedmetadata', function() {
        player.duration = player.audioElement.duration;
        if (nowPlayingPopup.elements.totalTime) {
            nowPlayingPopup.elements.totalTime.textContent = formatTime(player.duration);
        }
    });
    player.audioElement.addEventListener('play', onPlay);
    player.audioElement.addEventListener('pause', onPause);
    player.audioElement.addEventListener('error', function(e) {
        console.error('Audio playback error:', e.target.error);
    });

    createSeekTooltip();
    attachProgressBarEvents();
}

async function playSong(songData) {
    if (!songData) return;

    initPlayer();

    if (ui.elements.navbarNowPlaying) ui.elements.navbarNowPlaying.style.opacity = "0.5";
    let navbarSongTitle = document.getElementById("navbar-song-title");
    if (navbarSongTitle) navbarSongTitle.textContent = "Loading...";

    if (player.currentSong) {
        addToRecentlyPlayed(player.currentSong);
    }

    player.currentSong = songData;
    player.currentArtist = songData.artist;
    player.currentAlbum = songData.album;

    let formats = ['mp3', 'ogg', 'm4a'];
    let isLoaded = false;

    for (let format of formats) {
        try {
            let songFileName = songData.title.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
            let audioUrl = `https://koders.cloud/global/content/audio/${songFileName}.${format}`;
            
            if (player.isPlaying) player.audioElement.pause();
            
            player.audioElement.src = audioUrl;
            
            await new Promise((resolve, reject) => {
                let canPlayHandler = function() {
                    player.audioElement.removeEventListener('error', errorHandler);
                    resolve();
                };
                let errorHandler = function(e) {
                    player.audioElement.removeEventListener('canplaythrough', canPlayHandler);
                    reject(new Error(`Format ${format} failed to load: ${e.target.error?.code}`));
                };
                player.audioElement.addEventListener('canplaythrough', canPlayHandler, { once: true });
                player.audioElement.addEventListener('error', errorHandler, { once: true });
            });

            await player.audioElement.play();
            isLoaded = true;
            break; 
        } catch (error) {
            console.warn(error.message);
        }
    }

    if (isLoaded) {
        updateNowPlayingInfo();
        updateNavbarInfo();
        updateNowPlayingPopupContent();
        updateDropdownCounts();
        updateMediaSession();
        if (ui.elements.navbarLogo) ui.elements.navbarLogo.classList.add("hidden");
        if (ui.elements.navbarAlbumCover) ui.elements.navbarAlbumCover.classList.remove("hidden");
    } else {
        console.error(`Could not play "${songData.title}". All supported formats failed.`);
        if (navbarSongTitle) navbarSongTitle.textContent = player.currentSong?.title || "Error";
    }
    
    if (ui.elements.navbarNowPlaying) ui.elements.navbarNowPlaying.style.opacity = "1";
    syncGlobalState();
}

function togglePlayPause() {
    if (!player.currentSong || !player.audioElement) return;
    player.isPlaying ? player.audioElement.pause() : player.audioElement.play();
}

function onPlay() {
    player.isPlaying = true;
    updatePlayPauseButtons();
    updateMediaSessionPlaybackState();
}

function onPause() {
    player.isPlaying = false;
    updatePlayPauseButtons();
    updateMediaSessionPlaybackState();
}

function stopPlayback() {
    player.isPlaying = false;
    updatePlayPauseButtons();
}

function handleSongEnd() {
    if (player.repeatMode === 'one') {
        player.audioElement.currentTime = 0;
        player.audioElement.play();
        return;
    }

    if (player.queue.length > 0) {
        nextTrack();
        return;
    }

    let artist = window.music.find(a => a.artist === player.currentArtist);
    let album = artist?.albums.find(al => al.album === player.currentAlbum);

    if (!album || album.songs.length === 0) {
        stopPlayback();
        return;
    }

    let nextSongData = null;
    if (player.shuffleMode) {
        let randomIndex = Math.floor(Math.random() * album.songs.length);
        nextSongData = album.songs[randomIndex];
    } else if (player.repeatMode === 'all') {
        let currentSongIndex = album.songs.findIndex(s => s.title === player.currentSong.title);
        let nextIndex = (currentSongIndex + 1) % album.songs.length;
        nextSongData = album.songs[nextIndex];
    }

    if (nextSongData) {
        playSong({
            ...nextSongData,
            artist: artist.artist,
            album: album.album,
            cover: getAlbumImageUrl(album.album)
        });
    } else {
        stopPlayback();
    }
    
    syncGlobalState();
}

function nextTrack() {
    if (player.queue.length > 0) {
        let nextSong = player.queue.shift();
        playSong(nextSong);
        updateQueueTab();
        updateDropdownCounts();
        return;
    }

    let artist = window.music.find(a => a.artist === player.currentArtist);
    let album = artist?.albums.find(al => al.album === player.currentAlbum);
    if (album && album.songs.length > 0) {
        let songIndex = album.songs.findIndex(s => s.title === player.currentSong.title);
        let nextSongIndex = (songIndex + 1) % album.songs.length;
        let nextSong = {
            ...album.songs[nextSongIndex],
            artist: artist.artist,
            album: album.album,
            cover: getAlbumImageUrl(album.album)
        };
        playSong(nextSong);
    }
    syncGlobalState();
}

function previousTrack() {
    if (player.audioElement && player.audioElement.currentTime > 3) {
        player.audioElement.currentTime = 0;
        return;
    }

    if (player.recentlyPlayed.length > 0) {
        let prevSong = player.recentlyPlayed.shift();
        playSong(prevSong);
        updateQueueTab();
        updateDropdownCounts();
        return;
    }

    let artist = window.music.find(a => a.artist === player.currentArtist);
    let album = artist?.albums.find(al => al.album === player.currentAlbum);
    if (album && album.songs.length > 0) {
        let songIndex = album.songs.findIndex(s => s.title === player.currentSong.title);
        let prevSongIndex = (songIndex - 1 + album.songs.length) % album.songs.length;
        let prevSong = {
            ...album.songs[prevSongIndex],
            artist: artist.artist,
            album: album.album,
            cover: getAlbumImageUrl(album.album)
        };
        playSong(prevSong);
    }
}

function addToQueue(song, position = null) {
    if (position !== null) player.queue.splice(position, 0, song);
    else player.queue.push(song);
    updateQueueTab();
    updateDropdownCounts();
    syncGlobalState();
}

function addToRecentlyPlayed(song) {
    if (!song) return;
    player.recentlyPlayed = player.recentlyPlayed.filter((s) => s.id !== song.id);
    player.recentlyPlayed.unshift(song);
    if (player.recentlyPlayed.length > 20) player.recentlyPlayed.pop();
    updateRecentTab();
    updateDropdownCounts();
    syncGlobalState();
}

function toggleShuffle() {
    player.shuffleMode = !player.shuffleMode;
    updateNowPlayingButtons();
    updateMediaSessionPlaybackState();
}

function toggleRepeat() {
    let modes = ['off', 'one', 'all'];
    let currentModeIndex = modes.indexOf(player.repeatMode);
    player.repeatMode = modes[(currentModeIndex + 1) % modes.length];
    updateNowPlayingButtons();
    updateMediaSessionPlaybackState();
}

function seekTo(e) {
    if (!player.currentSong || !nowPlayingPopup.elements.progressBar || !player.audioElement || !player.duration) return;
    let rect = nowPlayingPopup.elements.progressBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    player.audioElement.currentTime = percent * player.duration;
}

function startDrag(e) {
    if (!player.currentSong) return;
    player.isDragging = true;
    e.preventDefault();
}

function onDrag(e) {
    if (!player.isDragging || !nowPlayingPopup.elements.progressBar) return;
    let rect = nowPlayingPopup.elements.progressBar.getBoundingClientRect();
    let percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    let newTime = percent * player.duration;
    
    if (player.audioElement) player.audioElement.currentTime = newTime;
    
    updateProgress(newTime);
    updateSeekTooltip(e, nowPlayingPopup.elements.progressBar);
}

function endDrag() {
    player.isDragging = false;
    hideSeekTooltip();
}

function updateProgress(time = null) {
    if (!player.audioElement || !player.duration) return;
    let currentTime = time !== null ? time : player.audioElement.currentTime;
    let percent = (currentTime / player.duration) * 100;

    if (nowPlayingPopup.elements.progressFill) nowPlayingPopup.elements.progressFill.style.width = `${percent}%`;
    if (nowPlayingPopup.elements.progressThumb) nowPlayingPopup.elements.progressThumb.style.left = `${percent}%`;
    if (nowPlayingPopup.elements.currentTime) nowPlayingPopup.elements.currentTime.textContent = formatTime(currentTime);

    if ("mediaSession" in navigator) {
        navigator.mediaSession.setPositionState({
            duration: player.duration,
            playbackRate: player.audioElement.playbackRate,
            position: currentTime,
        });
    }
}

function updateMediaSession() {
    if (!("mediaSession" in navigator) || !player.currentSong) return;

    let albumName = player.currentAlbum.toLowerCase().replace(/\s+/g, '');
    let artworkUrl = `https://koders.cloud/global/content/images/albumCovers/${albumName}.png`;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: player.currentSong.title,
        artist: player.currentArtist,
        album: player.currentAlbum,
        artwork: [{ src: artworkUrl, sizes: "512x512", type: "image/png" }]
    });

    navigator.mediaSession.setActionHandler("play", togglePlayPause);
    navigator.mediaSession.setActionHandler("pause", togglePlayPause);
    navigator.mediaSession.setActionHandler("previoustrack", previousTrack);
    navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
    navigator.mediaSession.setActionHandler("stop", function() { player.audioElement.pause(); });
    navigator.mediaSession.setActionHandler("seekbackward", function(d) { player.audioElement.currentTime -= d.seekOffset || player.rewindInterval; });
    navigator.mediaSession.setActionHandler("seekforward", function(d) { player.audioElement.currentTime += d.seekOffset || player.fastForwardInterval; });
    navigator.mediaSession.setActionHandler("seekto", function(d) { player.audioElement.currentTime = d.seekTime; });
}

function updateMediaSessionPlaybackState() {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = player.isPlaying ? "playing" : "paused";
    }
}

function createSeekTooltip() {
    if (document.getElementById('seek-tooltip')) {
        player.seekTooltip = document.getElementById('seek-tooltip');
        return;
    }
    let tooltip = document.createElement('div');
    tooltip.id = 'seek-tooltip';
    Object.assign(tooltip.style, {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        fontSize: '12px',
        padding: '4px 8px',
        borderRadius: '4px',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateX(-50%)',
        transition: 'opacity 0.2s',
        zIndex: '100'
    });
    let container = document.getElementById('now-playing-popup');
    if (container) {
        container.appendChild(tooltip);
        player.seekTooltip = tooltip;
    }
}

function attachProgressBarEvents() {
    let progressBar = nowPlayingPopup.elements.progressBar;
    if (!progressBar) return;
    progressBar.addEventListener('mousemove', function(e) { updateSeekTooltip(e, progressBar); });
    progressBar.addEventListener('mouseleave', hideSeekTooltip);
}

function updateSeekTooltip(e, progressBar) {
    if (!player.seekTooltip || !player.duration) return;
    let rect = progressBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    let seekTime = percent * player.duration;

    player.seekTooltip.textContent = formatTime(seekTime);
    player.seekTooltip.style.left = `${e.clientX - rect.left}px`;
    player.seekTooltip.style.bottom = '25px';
    player.seekTooltip.style.opacity = '1';
}

function hideSeekTooltip() {
    if (player.seekTooltip) {
        player.seekTooltip.style.opacity = '0';
    }
}

function playFromQueue(index) {
    if (index >= 0 && index < player.queue.length) {
        let song = player.queue.splice(index, 1)[0];
        playSong(song);
    }
}

function playFromRecent(index) {
    if (index >= 0 && index < player.recentlyPlayed.length) {
        playSong(player.recentlyPlayed[index]);
    }
}

function toggleCurrentSongFavorite() {
    if (!player.currentSong) return;
    let songId = player.currentSong.id;
    if (player.favorites.has(songId)) {
        player.favorites.delete(songId);
    } else {
        player.favorites.add(songId);
    }
    updateNowPlayingButtons();
    updateDropdownCounts();
}

function initNavbarElements() {
    let enhancedIds = [
        "will-hide-menu", "menu-trigger", "dropdown-menu", "dropdown-close", "now-playing-area", 
        "play-indicator", "prev-btn-navbar", "next-btn-navbar", "play-pause-navbar", 
        "play-icon-navbar", "pause-icon-navbar",
        "favorite-songs", "favorite-artists", "create-playlist", "recently-played", 
        "queue-view", "search-music", "shuffle-all", "app-settings", "about-app", 
        "favorite-songs-count", "favorite-artists-count", "recent-count", "queue-count"
    ];

    enhancedIds.forEach(function(id) {
        let camelCaseId = id.replace(/-(\w)/g, function(_, c) { return c.toUpperCase(); });
        navbar.elements[camelCaseId] = document.getElementById(id);
    });

    return navbar.elements;
}

function bindNavbarEvents() {
    bindMenuEvents();
    bindMenuItemEvents();
    bindNowPlayingEvents();
    bindControlEvents();
    bindPageEvents();
}

function bindPageEvents() {
    document.addEventListener("click", function(e) {
        if (navbar.elements.dropdownMenu && !navbar.elements.dropdownMenu.contains(e.target) && !navbar.elements.menuTrigger?.contains(e.target)) {
            closeDropdownMenu();
        }
        if (nowPlayingPopup.isVisible && !nowPlayingPopup.elements.nowPlayingPopup.contains(e.target) && !navbar.elements.nowPlayingArea?.contains(e.target)) {
            closeNowPlayingPopup();
        }
    });
    document.addEventListener("keydown", handleKeyboardShortcuts);

    document.addEventListener('click', function(e) {
        let navItem = e.target.closest('[data-nav]');
        if (!navItem) return;
        
        e.preventDefault();
        let navType = navItem.dataset.nav;
        
        closeDropdownMenu();
        
        switch (navType) {
            case 'home':
                loadHomePage();
                break;
            case 'allArtists':
                loadAllArtistsPage();
                break;
            case 'artist':
                let artistName = navItem.dataset.artist;
                if (artistName && window.siteMap) {
                    window.siteMap.navigateTo('artist', { artist: artistName });
                }
                break;
            case 'album':
                let artist = navItem.dataset.artist;
                let album = navItem.dataset.album;
                if (artist && album && window.siteMap) {
                    window.siteMap.navigateTo('album', { artist, album });
                }
                break;
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.closest('#global-search-trigger')) {
            e.preventDefault();
            closeDropdownMenu();
            if (window.siteMap) {
                window.siteMap.openSearchDialog();
            }
        }
    });
}

function bindMenuEvents() {
    if (navbar.elements.menuTrigger) navbar.elements.menuTrigger.addEventListener("click", toggleDropdownMenu);
    if (navbar.elements.dropdownClose) navbar.elements.dropdownClose.addEventListener("click", closeDropdownMenu);
    if (navbar.elements.willHideMenu) navbar.elements.willHideMenu.addEventListener("click", closeDropdownMenu);
}

function bindMenuItemEvents() {
    let menuActions = {
        favoriteSongs: openFavoriteSongs,
        favoriteArtists: openFavoriteArtists,
        createPlaylist: createNewPlaylist,
        recentlyPlayed: function() {
            openNowPlayingPopup();
            setTimeout(function() { switchPopupTab("recent"); }, 50);
        },
        queueView: function() {
            openNowPlayingPopup();
            setTimeout(function() { switchPopupTab("queue"); }, 50);
        },
        searchMusic: openSearch,
        shuffleAll: shuffleAllSongs,
        appSettings: openSettings,
        aboutApp: showAbout
    };

    Object.entries(menuActions).forEach(function([key, action]) {
        if (navbar.elements[key]) navbar.elements[key].addEventListener("click", action);
    });

    if (ui.elements.themeToggle) ui.elements.themeToggle.addEventListener("click", enhancedThemeToggle);
}

function bindNowPlayingEvents() {
    if (navbar.elements.nowPlayingArea) navbar.elements.nowPlayingArea.addEventListener("click", toggleNowPlayingPopup);
    if (ui.elements.navbarAlbumCover) {
        ui.elements.navbarAlbumCover.addEventListener("click", function(e) {
            e.stopPropagation();
            toggleNowPlayingPopup();
        });
    }
}

function bindControlEvents() {
    let controlActions = {
        playPauseNavbar: function(e) {
            e.stopPropagation();
            togglePlayPause();
        },
        prevBtnNavbar: function(e) {
            e.stopPropagation();
            previousTrack();
        },
        nextBtnNavbar: function(e) {
            e.stopPropagation();
            nextTrack();
        }
    };

    Object.entries(controlActions).forEach(function([key, action]) {
        if (navbar.elements[key]) navbar.elements[key].addEventListener("click", action);
    });
}

function toggleDropdownMenu() {
    let isVisible = navbar.elements.dropdownMenu?.classList.contains("show");
    if (isVisible) {
        closeDropdownMenu();
    } else {
        openDropdownMenu();
    }
}

function openDropdownMenu() {
    if (!navbar.elements.dropdownMenu || !navbar.elements.menuTrigger) return;
    updateDropdownCounts();
    navbar.elements.dropdownMenu.classList.add("show");
    navbar.elements.menuTrigger.classList.add("active");
    closeNowPlayingPopup();
}

function closeDropdownMenu() {
    if (!navbar.elements.dropdownMenu || !navbar.elements.menuTrigger) return;
    navbar.elements.dropdownMenu.classList.remove("show");
    navbar.elements.menuTrigger.classList.remove("active");
}

function updateDropdownCounts() {
    let counts = {
        favoriteSongsCount: player.favorites.size,
        favoriteArtistsCount: navbar.favoriteArtists.size,
        recentCount: player.recentlyPlayed.length,
        queueCount: player.queue.length
    };

    Object.entries(counts).forEach(function([key, value]) {
        if (navbar.elements[key]) {
            navbar.elements[key].textContent = value;
        }
    });
}

function openFavoriteSongs() {
    let favorites = player.favorites || new Set();
    closeDropdownMenu();
    if (favorites.size === 0) return;
}

function openFavoriteArtists() {
    closeDropdownMenu();
    if (navbar.favoriteArtists.size === 0) {
        showNotification("No favorite artists yet");
        return;
    }
}

function createNewPlaylist() {
    closeDropdownMenu();
    let playlistName = prompt("Enter playlist name:");
    if (playlistName && playlistName.trim()) {
        let playlist = {
            id: Date.now().toString(),
            name: playlistName.trim(),
            songs: [],
            created: new Date().toISOString(),
        };
        navbar.playlists.push(playlist);
        showNotification(`Created playlist: ${playlist.name}`);
    }
}

function openSearch() {
    closeDropdownMenu();
}

function shuffleAllSongs() {
    closeDropdownMenu();
    if (!window.music || window.music.length === 0) {
        showNotification("No music library found");
        return;
    }

    let allSongs = [];
    window.music.forEach(function(artist) {
        artist.albums.forEach(function(album) {
            album.songs.forEach(function(song) {
                allSongs.push({
                    ...song,
                    artist: artist.artist,
                    album: album.album,
                    cover: getAlbumImageUrl(album.album),
                });
            });
        });
    });

    if (allSongs.length === 0) {
        showNotification("No songs found");
        return;
    }

    for (let i = allSongs.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
    }

    player.queue = allSongs.slice(1);
    playSong(allSongs[0]);
    player.shuffleMode = true;
    updateDropdownCounts();
}

function openSettings() {
    closeDropdownMenu();
}

function showAbout() {
    closeDropdownMenu();
}

function enhancedThemeToggle() {
    let html = document.documentElement;
    if (html.classList.contains("light")) {
        html.classList.remove("light");
        html.classList.remove("medium");
        updateThemeIcon("dark");
    } else if (html.classList.contains("medium")) {
        html.classList.remove("medium");
        html.classList.add("light");
        updateThemeIcon("light");
    } else {
        html.classList.add("medium");
        updateThemeIcon("medium");
    }
}

function updateThemeIcon(theme) {
    let themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        let icons = {
            dark: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 116.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>',
            medium: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L13 9h7l-5.5 4 2 7L10 16l-6.5 4 2-7L1 9h7l2-7z"/></svg>',
            light: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>'
        };
        themeToggle.innerHTML = icons[theme];
    }
}

function handleKeyboardShortcuts(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    let keyActions = {
        " ": function() {
            e.preventDefault();
            togglePlayPause();
        },
        ArrowLeft: function() {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                previousTrack();
            }
        },
        ArrowRight: function() {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                nextTrack();
            }
        },
        n: function() {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                openNowPlayingPopup();
            }
        },
        m: function() {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                toggleDropdownMenu();
            }
        },
        s: function() {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                toggleShuffle();
            }
        },
        f: function() {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                toggleCurrentSongFavorite();
            }
        },
        r: function() {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                toggleRepeat();
            }
        },
        Escape: function() {
            closeNowPlayingPopup();
            closeDropdownMenu();
        }
    };

    if (keyActions[e.key]) {
        keyActions[e.key]();
    }
}

function initNowPlayingPopup() {
    cachePopupElements();
    bindPopupEvents();
}

function cachePopupElements() {
    let elementIds = [
        'now-playing-popup', 'popup-close', 'popup-album-cover', 'popup-song-title',
        'popup-artist-name', 'popup-album-name', 'popup-current-time', 'popup-total-time',
        'popup-progress-bar', 'popup-progress-fill', 'popup-progress-thumb',
        'popup-play-pause-btn', 'popup-play-icon', 'popup-pause-icon',
        'popup-prev-btn', 'popup-next-btn', 'popup-shuffle-btn', 'popup-repeat-btn',
        'popup-favorite-btn', 'queue-list', 'recent-list'
    ];

    elementIds.forEach(function(id) {
        let camelCaseId = id.replace(/-(\w)/g, function(_, c) { return c.toUpperCase(); });
        nowPlayingPopup.elements[camelCaseId] = document.getElementById(id);
    });

    nowPlayingPopup.elements.progressBar = nowPlayingPopup.elements.popupProgressBar;
    nowPlayingPopup.elements.progressFill = nowPlayingPopup.elements.popupProgressFill;
    nowPlayingPopup.elements.progressThumb = nowPlayingPopup.elements.popupProgressThumb;
    nowPlayingPopup.elements.currentTime = nowPlayingPopup.elements.popupCurrentTime;
    nowPlayingPopup.elements.totalTime = nowPlayingPopup.elements.popupTotalTime;
}

function bindPopupEvents() {
    document.querySelectorAll('.popup-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            switchPopupTab(tab.dataset.tab);
            resetInactivityTimer();
        });
    });

    if (nowPlayingPopup.elements.popupClose) nowPlayingPopup.elements.popupClose.addEventListener('click', closeNowPlayingPopup);
    if (nowPlayingPopup.elements.popupPlayPauseBtn) nowPlayingPopup.elements.popupPlayPauseBtn.addEventListener('click', togglePlayPause);
    if (nowPlayingPopup.elements.popupPrevBtn) nowPlayingPopup.elements.popupPrevBtn.addEventListener('click', previousTrack);
    if (nowPlayingPopup.elements.popupNextBtn) nowPlayingPopup.elements.popupNextBtn.addEventListener('click', nextTrack);
    if (nowPlayingPopup.elements.popupShuffleBtn) nowPlayingPopup.elements.popupShuffleBtn.addEventListener('click', toggleShuffle);
    if (nowPlayingPopup.elements.popupRepeatBtn) nowPlayingPopup.elements.popupRepeatBtn.addEventListener('click', toggleRepeat);
    if (nowPlayingPopup.elements.popupFavoriteBtn) nowPlayingPopup.elements.popupFavoriteBtn.addEventListener('click', toggleCurrentSongFavorite);

    if (nowPlayingPopup.elements.progressBar) {
        nowPlayingPopup.elements.progressBar.addEventListener('click', seekTo);
    }
    if (nowPlayingPopup.elements.progressThumb) {
        nowPlayingPopup.elements.progressThumb.addEventListener('mousedown', startDrag);
    }

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);

    document.addEventListener('keydown', function(e) {
        if (!nowPlayingPopup.isVisible) return;
        handlePopupKeyboard(e);
    });
}

function openNowPlayingPopup() {
    if (!nowPlayingPopup.elements.nowPlayingPopup) return;
    
    nowPlayingPopup.isVisible = true;
    nowPlayingPopup.elements.nowPlayingPopup.classList.add('show');
    updateNowPlayingPopupContent();
    switchPopupTab('now-playing');
    startInactivityTimer();
    closeDropdownMenu();
}

function closeNowPlayingPopup() {
    if (!nowPlayingPopup.elements.nowPlayingPopup) return;
    
    nowPlayingPopup.isVisible = false;
    nowPlayingPopup.elements.nowPlayingPopup.classList.remove('show');
    clearInactivityTimer();
}

function toggleNowPlayingPopup() {
    nowPlayingPopup.isVisible ? closeNowPlayingPopup() : openNowPlayingPopup();
}

function switchPopupTab(tabName) {
    nowPlayingPopup.currentTab = tabName;
    
    document.querySelectorAll('.popup-tab').forEach(function(tab) {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.popup-tab-content').forEach(function(content) {
        let shouldShow = content.dataset.tab === tabName;
        content.style.display = shouldShow ? 'block' : 'none';
    });
    
    if (tabName === 'queue') {
        updateQueueTab();
    } else if (tabName === 'recent') {
        updateRecentTab();
    }
}

function updateNowPlayingPopupContent() {
    if (!player.currentSong) return;

    if (nowPlayingPopup.elements.popupAlbumCover) {
        loadImageWithFallback(
            nowPlayingPopup.elements.popupAlbumCover,
            getAlbumImageUrl(player.currentSong.album),
            getDefaultAlbumImage(),
            'album'
        );
    }

    if (nowPlayingPopup.elements.popupSongTitle) nowPlayingPopup.elements.popupSongTitle.textContent = player.currentSong.title;
    if (nowPlayingPopup.elements.popupArtistName) nowPlayingPopup.elements.popupArtistName.textContent = player.currentSong.artist;
    if (nowPlayingPopup.elements.popupAlbumName) nowPlayingPopup.elements.popupAlbumName.textContent = player.currentSong.album;
    if (nowPlayingPopup.elements.totalTime) nowPlayingPopup.elements.totalTime.textContent = formatTime(player.duration);

    updateNowPlayingButtons();
}

function updateNowPlayingButtons() {
    if (nowPlayingPopup.elements.popupPlayIcon && nowPlayingPopup.elements.popupPauseIcon) {
        nowPlayingPopup.elements.popupPlayIcon.classList.toggle('hidden', player.isPlaying);
        nowPlayingPopup.elements.popupPauseIcon.classList.toggle('hidden', !player.isPlaying);
    }

    if (nowPlayingPopup.elements.popupShuffleBtn) {
        nowPlayingPopup.elements.popupShuffleBtn.classList.toggle('active', player.shuffleMode);
    }

    if (nowPlayingPopup.elements.popupRepeatBtn) {
        nowPlayingPopup.elements.popupRepeatBtn.classList.toggle('active', player.repeatMode !== 'off');
    }

    if (nowPlayingPopup.elements.popupFavoriteBtn && player.currentSong) {
        let isFavorite = player.favorites.has(player.currentSong.id);
        nowPlayingPopup.elements.popupFavoriteBtn.classList.toggle('active', isFavorite);
    }
}
/**
function updateQueueTab() {
    if (!nowPlayingPopup.elements.queueList) return;
    
    if (player.queue.length === 0) {
        nowPlayingPopup.elements.queueList.innerHTML = '<li class="empty-state">Queue is empty</li>';
        return;
    }

    nowPlayingPopup.elements.queueList.innerHTML = player.queue.map(function(song, index) {
        return `
            <li class="popup-song-item" data-index="${index}">
                <img class="popup-song-cover" src="${song.cover || getAlbumImageUrl(song.album)}" alt="${song.title}">
                <div class="popup-song-info">
                    <p class="popup-song-title">${song.title}</p>
                    <p class="popup-song-artist">${song.artist}</p>
                </div>
                <span class="popup-song-duration">${song.duration || ''}</span>
            </li>
        `;
    }).join('');

    nowPlayingPopup.elements.queueList.querySelectorAll('.popup-song-item').forEach(function(item) {
        item.addEventListener('click', function() {
            let index = parseInt(item.dataset.index);
            playFromQueue(index);
        });
    });
}

function updateRecentTab() {
    if (!nowPlayingPopup.elements.recentList) return;
    
    if (player.recentlyPlayed.length === 0) {
        nowPlayingPopup.elements.recentList.innerHTML = '<li class="empty-state">No recently played songs</li>';
        return;
    }

    nowPlayingPopup.elements.recentList.innerHTML = player.recentlyPlayed.map(function(song, index) {
        return `
            <li class="popup-song-item" data-index="${index}">
                <img class="popup-song-cover" src="${song.cover || getAlbumImageUrl(song.album)}" alt="${song.title}">
                <div class="popup-song-info">
                    <p class="popup-song-title">${song.title}</p>
                    <p class="popup-song-artist">${song.artist}</p>
                </div>
                <span class="popup-song-duration">${song.duration || ''}</span>
            </li>
        `;
    }).join('');

    nowPlayingPopup.elements.recentList.querySelectorAll('.popup-song-item').forEach(function(item) {
        item.addEventListener('click', function() {
            let index = parseInt(item.dataset.index);
            playFromRecent(index);
        });
    });
}
**/
function startInactivityTimer() {
    resetInactivityTimer();
}

function resetInactivityTimer() {
    clearInactivityTimer();
    if (nowPlayingPopup.currentTab !== 'now-playing') {
        nowPlayingPopup.inactivityTimer = setTimeout(function() {
            switchPopupTab('now-playing');
        }, 10000);
    }
}

function clearInactivityTimer() {
    if (nowPlayingPopup.inactivityTimer) {
        clearTimeout(nowPlayingPopup.inactivityTimer);
        nowPlayingPopup.inactivityTimer = null;
    }
}

function handlePopupKeyboard(e) {
    let keyActions = {
        'ArrowLeft': switchToPrevTab,
        'ArrowRight': switchToNextTab,
        '1': function() { switchPopupTab('now-playing'); },
        '2': function() { switchPopupTab('queue'); },
        '3': function() { switchPopupTab('recent'); },
        'Escape': closeNowPlayingPopup
    };

    if (keyActions[e.key]) {
        e.preventDefault();
        keyActions[e.key]();
        resetInactivityTimer();
    }
}

function switchToPrevTab() {
    let tabs = ['now-playing', 'queue', 'recent'];
    let currentIndex = tabs.indexOf(nowPlayingPopup.currentTab);
    let prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    switchPopupTab(tabs[prevIndex]);
}

function switchToNextTab() {
    let tabs = ['now-playing', 'queue', 'recent'];
    let currentIndex = tabs.indexOf(nowPlayingPopup.currentTab);
    let nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    switchPopupTab(tabs[nextIndex]);
}

function initUIElements() {
    let ids = [
        "home-page", "artist-page", "featured-artists", "navbar", "navbar-logo", 
        "navbar-album-cover", "navbar-now-playing", "navbar-song-title", "navbar-artist", 
        "breadcrumb", "breadcrumb-home", "breadcrumb-artist", "breadcrumb-album", 
        "theme-toggle"
    ];

    ids.forEach(function(id) {
        let camelCaseId = id.replace(/-(\w)/g, function(_, c) { return c.toUpperCase(); });
        ui.elements[camelCaseId] = document.getElementById(id);
    });

    if (!ui.elements.featuredArtists) {
        throw new Error("Essential page elements are missing from the DOM.");
    }
}

function updateNowPlayingInfo() {
    if (!player.currentSong) return;
    updateNowPlayingPopupContent();
}

function updateNavbarInfo() {
    if (!player.currentSong || !ui.elements.navbarAlbumCover || !ui.elements.navbarArtist || !ui.elements.navbarSongTitle) return;
    
    loadImageWithFallback(
        ui.elements.navbarAlbumCover,
        getAlbumImageUrl(player.currentSong.album),
        getDefaultAlbumImage(),
        'album'
    );
    
    ui.elements.navbarArtist.textContent = player.currentSong.artist;
    let title = player.currentSong.title;
    ui.elements.navbarSongTitle.classList.toggle("marquee", title.length > 25);
    ui.elements.navbarSongTitle.textContent = title;

    if (navbar.elements.playIndicator) {
        navbar.elements.playIndicator.classList.toggle("active", player.isPlaying);
    }
    if (navbar.elements.nowPlayingArea) {
        navbar.elements.nowPlayingArea.classList.add("has-song");
    }
}

function updatePlayPauseButtons() {
    if (navbar.elements.playIconNavbar && navbar.elements.pauseIconNavbar) {
        navbar.elements.playIconNavbar.classList.toggle("hidden", player.isPlaying);
        navbar.elements.pauseIconNavbar.classList.toggle("hidden", !player.isPlaying);
    }

    updateNowPlayingButtons();
}

function bindUIEvents() {
    window.addEventListener("scroll", function() {
        ui.elements.navbar?.classList.toggle("floating", window.scrollY > 50);
    });

    if (ui.elements.breadcrumbHome) ui.elements.breadcrumbHome.addEventListener("click", loadHomePage);
    if (ui.elements.navbarAlbumCover) ui.elements.navbarAlbumCover.addEventListener("click", toggleNowPlayingPopup);
    
    let navbarSongTitle = document.getElementById("navbar-song-title");
    if (navbarSongTitle) navbarSongTitle.addEventListener("click", toggleNowPlayingPopup);
}

function bindDynamicPageEvents() {
    document.querySelectorAll(".song-item").forEach(function(item) {
        let newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener("click", function(e) {
            if (!e.target.closest(".song-toolbar")) {
                try {
                    let songData = JSON.parse(newItem.dataset.song);
                    playSong(songData);
                } catch (err) {
                    console.error("Failed to parse song data:", err);
                }
            }
        });
    });
    
    document.querySelectorAll(".song-toolbar button").forEach(function(button) {
        button.addEventListener("click", function(e) {
            e.stopPropagation();
            let action = button.dataset.action;
            if (action) handleToolbarAction(action, button);
        });
    });
    
    let playArtistBtn = document.querySelector(".play-artist");
    if (playArtistBtn) {
        playArtistBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            playAllArtistSongs();
        });
    }
    
    if (window.HSStaticMethods) window.HSStaticMethods.autoInit();
}

function handleToolbarAction(action, button) {
    let songItem = button.closest(".song-item");
    if (!songItem) return;
    
    try {
        let songData = JSON.parse(songItem.dataset.song);
        let songId = songData.id;
        
        switch (action) {
            case "favorite":
                if (player.favorites.has(songId)) {
                    player.favorites.delete(songId);
                    button.classList.remove("active");
                } else {
                    player.favorites.add(songId);
                    button.classList.add("active");
                }
                break;
            case "play-next":
                addToQueue(songData, 0);
                break;
            case "add-queue":
                addToQueue(songData);
                break;
            case "share":
                shareSong(songData);
                break;
        }
    } catch (err) {
        console.error("Toolbar action failed:", err);
    }
}

function initializeNotifications() {
    if (!ui.notificationContainer) {
        ui.notificationContainer = document.createElement("div");
        ui.notificationContainer.className = "fixed z-50 right-4 bottom-4 space-y-2 max-w-sm";
        document.body.appendChild(ui.notificationContainer);
        
        ui.historyOverlay = document.createElement("div");
        ui.historyOverlay.className = "hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center";
        document.body.appendChild(ui.historyOverlay);
        
        ui.historyPanel = document.createElement("div");
        ui.historyPanel.className = "bg-[#161b22] text-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-4 space-y-2";
        ui.historyOverlay.appendChild(ui.historyPanel);
        
        ui.historyBtn = document.createElement("button");
        ui.historyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v6h6M21 21v-6h-6M3 21h6v-6M21 3h-6v6"/></svg>';
        ui.historyBtn.className = "fixed bottom-4 left-4 z-50";
        ui.historyBtn.addEventListener("click", function() {
            updateNotificationHistory();
            ui.historyOverlay.classList.remove("hidden");
        });
        document.body.appendChild(ui.historyBtn);
        
        ui.historyOverlay.addEventListener("click", function(e) {
            if (e.target === ui.historyOverlay) ui.historyOverlay.classList.add("hidden");
        });
    }
    
    ui.notifications = ui.notifications || [];
    ui.currentNotificationTimeout = null;
}

function showNotification(message, type = "info", undoCallback = null) {
    if (!ui.notificationContainer) {
        initializeNotifications();
    }
    
    let typeStyles = {
        info: "bg-[#316dca] border-[#265db5] text-white",
        success: "bg-[#238636] border-[#2ea043] text-white", 
        warning: "bg-[#bb8009] border-[#d29922] text-white",
        error: "bg-[#da3633] border-[#f85149] text-white"
    };
    
    let noteIndex = ui.notifications.length;
    let note = { message, type, undo: undoCallback };
    ui.notifications.push(note);
    
    let notification = document.createElement("div");
    notification.className = `relative border px-5 py-4 rounded-md shadow-md flex items-start justify-between gap-4 text-md ${typeStyles[type] || typeStyles.info}`;
    
    let msgSpan = document.createElement("span");
    msgSpan.className = "flex-1";
    msgSpan.innerText = message;
    notification.appendChild(msgSpan);
    
    let actions = document.createElement("div");
    actions.className = "absolute top-5 bottom-5 right-2 flex items-center space-x-2";
    
    if (undoCallback) {
        let undo = document.createElement("button");
        undo.innerHTML = '<svg class="w-5 h-5 text-white hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>';
        undo.addEventListener("click", function() {
            if (typeof undoCallback === "function") {
                undoCallback();
                removeNotification(notification);
            }
        });
        actions.appendChild(undo);
    }
    
    let close = document.createElement("button");
    close.innerHTML = '<svg class="w-5 h-5 text-white hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    close.addEventListener("click", function() { removeNotification(notification); });
    actions.appendChild(close);
    notification.appendChild(actions);
    
    notification.addEventListener("mouseenter", function() {
        actions.classList.remove("hidden");
    });
    notification.addEventListener("mouseleave", function() {
        if (!ui.historyOverlay || ui.historyOverlay.classList.contains("hidden")) return;
        actions.classList.add("hidden");
    });
    
    ui.notificationContainer.appendChild(notification);
    
    if (ui.currentNotificationTimeout) clearTimeout(ui.currentNotificationTimeout);
    ui.currentNotificationTimeout = setTimeout(function() { removeNotification(notification); }, 5000);
    
    return notification;
}

function removeNotification(element) {
    element.classList.add("opacity-0", "translate-y-2", "transition-all", "duration-300");
    setTimeout(function() { element.remove(); }, 300);
}

function updateNotificationHistory() {
    if (!ui.historyPanel) return;
    
    ui.historyPanel.innerHTML = "";
    let typeStyles = {
        info: "bg-[#316dca] border-[#265db5] text-white",
        success: "bg-[#238636] border-[#2ea043] text-white", 
        warning: "bg-[#bb8009] border-[#d29922] text-white",
        error: "bg-[#da3633] border-[#f85149] text-white"
    };
    
    ui.notifications.forEach(function(note, i) {
        let el = document.createElement("div");
        el.className = `relative border px-3 py-2 rounded-md shadow-md flex items-start justify-between gap-4 text-sm mb-2 ${typeStyles[note.type] || typeStyles.info}`;
        
        let msgSpan = document.createElement("span");
        msgSpan.className = "flex-1";
        msgSpan.innerText = note.message;
        el.appendChild(msgSpan);
        
        let actions = document.createElement("div");
        actions.className = "hidden absolute -top-3 right-1 flex items-center space-x-2";
        
        if (typeof note.undo === "function") {
            let undo = document.createElement("button");
            undo.innerHTML = '<svg class="w-5 h-5 text-white hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>';
            undo.disabled = i !== ui.notifications.length - 1;
            if (undo.disabled) undo.classList.add("opacity-30", "cursor-not-allowed");
            undo.addEventListener("click", function() {
                note.undo();
                el.remove();
                ui.notifications = ui.notifications.filter(function(_, index) { return index !== i; });
            });
            actions.appendChild(undo);
        }
        
        let close = document.createElement("button");
        close.innerHTML = '<svg class="w-5 h-5 text-white hover:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
        close.addEventListener("click", function() {
            el.remove();
            ui.notifications = ui.notifications.filter(function(_, index) { return index !== i; });
        });
        
        actions.appendChild(close);
        el.appendChild(actions);
        
        el.addEventListener("mouseenter", function() {
            actions.classList.remove("hidden");
        });
        el.addEventListener("mouseleave", function() {
            actions.classList.add("hidden");
        });
        
        ui.historyPanel.appendChild(el);
    });
    
    if (ui.notifications.length === 0) {
        let emptyState = document.createElement("div");
        emptyState.className = "text-center py-6 text-gray-400";
        emptyState.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No notifications yet</p>
        `;
        ui.historyPanel.appendChild(emptyState);
    }
}

function showLoadingBar() {
    if (document.getElementById("global-loading-bar")) return;
    
    ui.loadingProgress = 0;
    let loadingBar = createElementFromHTML('<div id="global-loading-bar" class="loading-bar"></div>');
    if (loadingBar) {
        document.body.appendChild(loadingBar);
        
        setTimeout(function() {
            loadingBar.classList.add('active');
            startLoadingProgress();
        }, 10);
    }
}

function startLoadingProgress() {
    let loadingBar = document.getElementById("global-loading-bar");
    if (!loadingBar) return;
    
    ui.loadingProgress = 0;
    updateLoadingProgress();
    
    ui.loadingTimer = setInterval(function() {
        if (ui.loadingProgress < 90) {
            let increment = ui.loadingProgress < 30 ? 15 : ui.loadingProgress < 60 ? 8 : 3;
            ui.loadingProgress = Math.min(90, ui.loadingProgress + increment);
            updateLoadingProgress();
        }
    }, 150);
}

function updateLoadingProgress() {
    let loadingBar = document.getElementById("global-loading-bar");
    if (loadingBar) {
        loadingBar.style.transform = `scaleX(${ui.loadingProgress / 100})`;
    }
}

function completeLoadingBar() {
    if (ui.loadingTimer) {
        clearInterval(ui.loadingTimer);
        ui.loadingTimer = null;
    }
    
    let loadingBar = document.getElementById("global-loading-bar");
    if (loadingBar) {
        ui.loadingProgress = 100;
        loadingBar.style.transform = 'scaleX(1)';
        
        setTimeout(function() {
            loadingBar.classList.add('complete');
            setTimeout(function() { loadingBar.remove(); }, 400);
        }, 100);
    }
}

function hideLoadingBar() {
    completeLoadingBar();
}

function showSkeletonLoader(element, height, count) {
    if (!element) return;
    element.innerHTML = "";
    for (let i = 0; i < count; i++) {
        let skeleton = document.createElement("div");
        skeleton.className = "skeleton";
        skeleton.style.height = height;
        element.appendChild(skeleton);
    }
}

function fadeInContent(element) {
    if (!element) return;
    element.classList.add("content-fade-in");
    setTimeout(function() { element.classList.remove("content-fade-in"); }, 600);
}

function updateBreadcrumbs(items = []) {
    let breadcrumbList = document.querySelector(".breadcrumb-list");
    if (!breadcrumbList) return;

    let prevItems = breadcrumbList.querySelectorAll(".breadcrumb-item");
    let prevSeparators = breadcrumbList.querySelectorAll(".breadcrumb-separator");

    let newLast = items[items.length - 1];
    let prevLast = prevItems[prevItems.length - 1];
    let prevLastText = prevLast?.textContent?.trim();

    let lastChanged = !prevLast || prevLastText !== newLast?.text;

    if (lastChanged && prevLast && prevSeparators.length > 0) {
        let prevSeparator = prevSeparators[prevSeparators.length - 1];

        prevLast.classList.add("fade-out-breadcrumb");
        prevSeparator.classList.add("fade-out-breadcrumb");

        setTimeout(function() {
            breadcrumbList.removeChild(prevLast);
            breadcrumbList.removeChild(prevSeparator);

            let newSeparator = document.createElement("li");
            newSeparator.className = "breadcrumb-separator fade-in-breadcrumb";
            newSeparator.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            `;
            breadcrumbList.appendChild(newSeparator);

            let newItem = document.createElement("li");
            newItem.className = "breadcrumb-item fade-in-breadcrumb";
            newItem.innerHTML = `<h4 aria-current="page">${newLast.text}</h4>`;
            breadcrumbList.appendChild(newItem);
        }, 400);
    } else {
        breadcrumbList.innerHTML = "";

        let homeItem = document.createElement("li");
        homeItem.className = "breadcrumb-item";
        homeItem.innerHTML = `
            <a href="/" class="breadcrumb" data-nav="home">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 
                        0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h4 class="hidden md:inline">Home</h4>
            </a>
        `;
        breadcrumbList.appendChild(homeItem);

        items.forEach(function(item, index) {
            let separator = document.createElement("li");
            separator.className = "breadcrumb-separator";
            separator.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            `;
            breadcrumbList.appendChild(separator);

            let listItem = document.createElement("li");
            listItem.className = "breadcrumb-item";

            if (index === items.length - 1) {
                listItem.innerHTML = `<h4 aria-current="page">${item.text}</h4>`;
            } else {
                listItem.innerHTML = `
                    <a href="${item.url}" class="breadcrumb" 
                       data-nav="${item.type}" ${Object.entries(item.params)
                           .map(function([k, v]) { return `data-${k}="${v}"`; })
                           .join(" ")}>
                        <h4>${item.text}</h4>
                    </a>
                `;
            }

            breadcrumbList.appendChild(listItem);
        });
    }
}

function renderRandomArtists() {
    if (!window.music || window.music.length === 0) {
        ui.elements.featuredArtists.innerHTML = "<p>No music library found.</p>";
        return;
    }
    
    let shuffled = [...window.music].sort(function() { return 0.5 - Math.random(); });
    let randomArtists = shuffled.slice(0, 4);
    ui.elements.featuredArtists.innerHTML = "";
    
    randomArtists.forEach(function(artist) {
        let artistElement = createElementFromHTML(
            renderTemplate("artistCard", {
                id: artist.id,
                artist: artist.artist,
                genre: artist.genre,
                cover: getArtistImageUrl(artist.artist),
                albumCount: artist.albums.length,
            })
        );
        
        let artistImage = artistElement?.querySelector('.artist-avatar');
        if (artistImage) {
            let artistImageUrl = getArtistImageUrl(artist.artist);
            let fallbackUrl = getDefaultArtistImage();
            loadImageWithFallback(artistImage, artistImageUrl, fallbackUrl, 'artist');
        }
        
        if (artistElement) {
            artistElement.addEventListener("click", function() { loadArtistPage(artist); });
            ui.elements.featuredArtists.appendChild(artistElement);
        }
    });
    
    fadeInContent(ui.elements.featuredArtists);
}

function loadHomePage() {
    pageManager.currentPage = "home";
    
    showLoading();
    
    updateBreadcrumbs([]);
    
    let homeContent = `
        <div class="text-center py-8 md:py-12">
            <h1 class="text-4xl md:text-5xl font-bold mb-6 gradient-text">Discover Amazing Music</h1>
            <p class="text-lg md:text-xl text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto">Explore artists, albums, and songs from your personal library with an immersive listening experience</p>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 px-4">Featured Artists</h2>
        <div id="featured-artists" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 px-4"></div>
    `;
    
    updatePageContent(homeContent, function() {
        renderRandomArtists();
        completeLoadingBar();
        hideLoading();
    });
}

function normalizeForUrl(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
}

function loadArtistPage(artist) {
    pageManager.currentPage = "artist";
    pageManager.currentArtist = artist;
    
    showLoading();
    
    updateBreadcrumbs([
        {
            type: 'artists',
            params: {},
            url: '/artists',
            text: 'Discography',
            icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`
        },
        {
            type: 'artist',
            params: { artist: artist.artist },
            url: `/artist/${normalizeForUrl(artist.artist)}/`,
            text: artist.artist
        }
    ]);
    
    clearPageContent(function() {
        let skeleton = `<div class="skeleton w-full h-[400px] rounded-lg"></div>`;
        document.getElementById('dynamic-content').innerHTML = skeleton;
        
        setTimeout(function() {
            let artistContent = renderTemplate("enhancedArtist", {
                artist: artist.artist,
                genre: artist.genre,
                cover: getArtistImageUrl(artist.artist),
                albumCount: artist.albums.length,
                songCount: getTotalSongs(artist),
            });
            
            updatePageContent(artistContent, function() {
                let artistHeader = document.getElementById('artist-header');
                let headerToggle = document.getElementById('header-toggle');
                
                if (artistHeader && headerToggle) {
                    let toggleHeader = function() {
                        artistHeader.classList.toggle('collapsed');
                    };
                    
                    headerToggle.addEventListener('click', toggleHeader);
                    
                    let keyHandler = function(e) {
                        if (e.altKey && e.key === 'h' && artistHeader) {
                            toggleHeader();
                        }
                    };
                    
                    if (window.currentHeaderKeyHandler) {
                        document.removeEventListener('keydown', window.currentHeaderKeyHandler);
                    }
                    
                    document.addEventListener('keydown', keyHandler);
                    window.currentHeaderKeyHandler = keyHandler;
                }
                
                let artistHeaderImage = document.querySelector('.artist-avatar img');
                if (artistHeaderImage) {
                    let artistImageUrl = getArtistImageUrl(artist.artist);
                    let fallbackUrl = getDefaultArtistImage();
                    loadImageWithFallback(artistHeaderImage, artistImageUrl, fallbackUrl, 'artist');
                }
                
                let similarContainer = document.getElementById("similar-artists-container");
                if (similarContainer && artist.similar) {
                    showSimilar = new SimilarArtistsCarousel(similarContainer);
                    
                    for (let i = 0; i < artist.similar.length; i++) {
                        let similarArtistName = artist.similar[i];
                        
                        let similarArtistData = window.music?.find(function(a) { return a.artist === similarArtistName; });
                        
                        if (!similarArtistData) {
                            similarArtistData = {
                                artist: similarArtistName,
                                id: `similar-${i}`,
                                albums: [],
                                genre: "Unknown"
                            };
                        }
                        
                        setTimeout(function() {
                            showSimilar.addArtist(similarArtistData);
                        }, i * 50);
                    }
                }
                
                let albumsContainer = document.getElementById("albums-container");
                if (albumsContainer && artist.albums?.length > 0) {
                    viewAlbum = new AlbumSelector(albumsContainer, artist);
                }
                
                completeLoadingBar();
                bindDynamicPageEvents();
                hideLoading();
            });
        }, 800);
    });
}

function loadAllArtistsPage() {
    pageManager.currentPage = "allArtists";
    
    showLoading();
    
    updateBreadcrumbs([
        {
            type: 'allArtists',
            params: {},
            url: '/artists/',
            text: 'Artists'
        }
    ]);
    
    let allArtistsContent = `
        <div class="page-header px-4 sm:px-6 py-4">
            <div class="filter-controls mb-6 flex flex-wrap gap-4 items-center">
                <div class="search-wrapper relative flex-grow max-w-md">
                    <input type="text" id="artist-search" 
                           class="w-full bg-bg-subtle border border-border-subtle rounded-lg py-2 px-4 pl-10 text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors"
                           placeholder="Search artists...">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-muted" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div id="genre-filters" class="genre-filters flex flex-wrap gap-2"></div>
                <div class="view-toggle ml-auto">
                    <button id="grid-view-btn" class="p-2 rounded-lg bg-bg-subtle hover:bg-bg-muted active:bg-accent-primary transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button id="list-view-btn" class="p-2 rounded-lg bg-bg-subtle hover:bg-bg-muted transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div id="artists-grid" class="artists-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6"></div>
    `;
    
    updatePageContent(allArtistsContent, function() {
        let artistsGrid = document.getElementById('artists-grid');
        showSkeletonLoader(artistsGrid, "220px", 10);
        
        setTimeout(function() {
            renderAllArtists(artistsGrid);
            setupArtistFilters();
            completeLoadingBar();
            fadeInContent(document.getElementById('dynamic-content'));
            hideLoading();
        }, 800);
    });
}

function showLoading() {
    let loadingOverlay = document.getElementById('content-loading');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    showLoadingBar();
}

function hideLoading() {
    let loadingOverlay = document.getElementById('content-loading');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
    completeLoadingBar();
}

function clearPageContent(callback) {
    let contentWrapper = document.getElementById('dynamic-content');
    if (!contentWrapper) {
        if (callback) callback();
        return;
    }
    
    contentWrapper.classList.add('fade-out');
    
    setTimeout(function() {
        contentWrapper.innerHTML = '';
        contentWrapper.classList.remove('fade-out');
        if (callback) callback();
    }, 300);
}

function updatePageContent(newContent, callback) {
    let contentWrapper = document.getElementById('dynamic-content');
    if (!contentWrapper) {
        if (callback) callback();
        return;
    }
    
    contentWrapper.classList.add('fade-out');
    
    setTimeout(function() {
        contentWrapper.innerHTML = newContent;
        contentWrapper.classList.remove('fade-out');
        
        contentWrapper.classList.add('fade-in');
        
        setTimeout(function() {
            contentWrapper.classList.remove('fade-in');
            if (callback) callback();
        }, 300);
    }, 300);
}

function renderAllArtists(container) {
    if (!container || !window.music) return;
    
    container.innerHTML = '';
    
    window.music.forEach(function(artist) {
        let artistElement = createElementFromHTML(
            `<div class="artist-card" data-artist-id="${artist.id}" data-nav="artist" data-artist="${artist.artist}">
                <div class="text-center">
                    <div class="artist-avatar w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden">
                        <img src="${getArtistImageUrl(artist.artist)}" alt="${artist.artist}" class="w-full h-full object-cover">
                    </div>
                    <h3 class="text-lg font-bold mb-2">${artist.artist}</h3>
                    <div class="genre-tag inline-block px-3 py-1 bg-blue-600 bg-opacity-30 rounded-full text-xs font-medium mb-3">${artist.genre || 'Unknown'}</div>
                    <p class="text-sm opacity-70">${artist.albums.length} album${artist.albums.length !== 1 ? 's' : ''}</p>
                </div>
            </div>`
        );
        
        let artistImage = artistElement?.querySelector('.artist-avatar img');
        if (artistImage) {
            let artistImageUrl = getArtistImageUrl(artist.artist);
            let fallbackUrl = getDefaultArtistImage();
            loadImageWithFallback(artistImage, artistImageUrl, fallbackUrl, 'artist');
        }
        
        if (artistElement) {
            container.appendChild(artistElement);
            
            artistElement.addEventListener('click', function() {
                window.siteMap.navigateTo('artist', { artist: artist.artist });
            });
        }
    });
}

function setupArtistFilters() {
    let genres = new Set();
    window.music?.forEach(function(artist) {
        if (artist.genre) genres.add(artist.genre);
    });
    
    let genreFilters = document.getElementById('genre-filters');
    if (genreFilters) {
        genreFilters.innerHTML = `<div class="genre-tag active" data-genre="all">All Genres</div>`;
        
        Array.from(genres).sort().forEach(function(genre) {
            let genreTag = document.createElement('div');
            genreTag.className = 'genre-tag';
            genreTag.dataset.genre = genre;
            genreTag.textContent = genre;
            genreFilters.appendChild(genreTag);
        });
        
        genreFilters.querySelectorAll('.genre-tag').forEach(function(tag) {
            tag.addEventListener('click', function() {
                genreFilters.querySelectorAll('.genre-tag').forEach(function(t) { t.classList.remove('active'); });
                tag.classList.add('active');
                
                let genre = tag.dataset.genre;
                filterArtistsByGenre(genre);
            });
        });
    }
    
    let searchInput = document.getElementById('artist-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterArtistsBySearch(searchInput.value);
        });
    }
    
    let gridViewBtn = document.getElementById('grid-view-btn');
    let listViewBtn = document.getElementById('list-view-btn');
    let artistsGrid = document.getElementById('artists-grid');
    
    if (gridViewBtn && listViewBtn && artistsGrid) {
        gridViewBtn.addEventListener('click', function() {
            gridViewBtn.classList.add('active', 'bg-accent-primary', 'text-white');
            listViewBtn.classList.remove('active', 'bg-accent-primary', 'text-white');
            
            artistsGrid.classList.remove('list-view');
            artistsGrid.classList.add('grid-view');
            
            localStorage.setItem('artistsViewMode', 'grid');
        });
        
        listViewBtn.addEventListener('click', function() {
            listViewBtn.classList.add('active', 'bg-accent-primary', 'text-white');
            gridViewBtn.classList.remove('active', 'bg-accent-primary', 'text-white');
            
            artistsGrid.classList.remove('grid-view');
            artistsGrid.classList.add('list-view');
            
            localStorage.setItem('artistsViewMode', 'list');
        });
        
        let savedViewMode = localStorage.getItem('artistsViewMode') || 'grid';
        if (savedViewMode === 'list') {
            listViewBtn.click();
        } else {
            gridViewBtn.click();
        }
    }
}

function filterArtistsByGenre(genre) {
    let artistsGrid = document.getElementById('artists-grid');
    let artists = artistsGrid?.querySelectorAll('.artist-card');
    
    if (!artistsGrid || !artists) return;
    
    if (genre === 'all') {
        artists.forEach(function(artist) { artist.style.display = ''; });
    } else {
        artists.forEach(function(artist) {
            let artistGenre = artist.querySelector('.genre-tag')?.textContent;
            artist.style.display = artistGenre === genre ? '' : 'none';
        });
    }
}

function filterArtistsBySearch(query) {
    if (!query) {
        let activeGenre = document.querySelector('.genre-tag.active')?.dataset.genre || 'all';
        return filterArtistsByGenre(activeGenre);
    }
    
    let artistsGrid = document.getElementById('artists-grid');
    let artists = artistsGrid?.querySelectorAll('.artist-card');
    
    if (!artistsGrid || !artists) return;
    
    let searchQuery = query.toLowerCase().trim();
    
    artists.forEach(function(artist) {
        let artistName = artist.querySelector('h3')?.textContent?.toLowerCase() || '';
        artist.style.display = artistName.includes(searchQuery) ? '' : 'none';
    });
}

function getArtistImageUrl(artistName) {
    if (!artistName) return getDefaultArtistImage();
    let normalizedName = normalizeNameForUrl(artistName);
    return `https://koders.cloud/global/content/images/artistPortraits/${normalizedName}.png`;
}

function getAlbumImageUrl(albumName) {
    if (!albumName) return getDefaultAlbumImage();
    let normalizedName = normalizeNameForUrl(albumName);
    return `https://koders.cloud/global/content/images/albumCovers/${normalizedName}.png`;
}

function normalizeNameForUrl(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function getDefaultArtistImage() {
    return 'https://koders.cloud/global/content/images/artistPortraits/default-artist.png';
}

function getDefaultAlbumImage() {
    return 'https://koders.cloud/global/content/images/albumCovers/default-album.png';
}

function loadImageWithFallback(imgElement, primaryUrl, fallbackUrl, type = 'image') {
    if (!imgElement) return;

    let testImage = new Image();
    
    testImage.onload = function() {
        imgElement.src = primaryUrl;
        imgElement.classList.remove('image-loading', 'image-error');
        imgElement.classList.add('image-loaded');
    };
    
    testImage.onerror = function() {
        let fallbackImage = new Image();
        
        fallbackImage.onload = function() {
            imgElement.src = fallbackUrl;
            imgElement.classList.remove('image-loading');
            imgElement.classList.add('image-loaded', 'image-fallback');
        };
        
        fallbackImage.onerror = function() {
            imgElement.classList.remove('image-loading');
            imgElement.classList.add('image-error');
            imgElement.src = generatePlaceholderImage(type);
        };
        
        fallbackImage.src = fallbackUrl;
    };
    
    imgElement.classList.add('image-loading');
    imgElement.classList.remove('image-loaded', 'image-error', 'image-fallback');
    testImage.src = primaryUrl;
}

function generatePlaceholderImage(type) {
    let isArtist = type === 'artist';
    let bgColor = isArtist ? '#4F46E5' : '#059669';
    let icon = isArtist ? 
        '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' :
        '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>';
    
    let svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${bgColor}"/>
        <svg x="75" y="75" width="50" height="50" viewBox="0 0 24 24" fill="white">
            ${icon}
        </svg>
    </svg>`;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function parseDuration(durationStr) {
    if (typeof durationStr !== "string") return 0;
    let parts = durationStr.split(":").map(Number);
    return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) ? parts[0] * 60 + parts[1] : 0;
}

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getTotalSongs(artist) {
    return artist.albums.reduce(function(total, album) { return total + album.songs.length; }, 0);
}

async function shareSong(song) {
    let shareData = {
        title: `${song.title} by ${song.artist}`,
        text: `Check out "${song.title}" by ${song.artist}`,
        url: window.location.href,
    };
    
    try {
        if (navigator.share && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.text);
        }
    } catch (err) {
        console.error("Share/Copy failed:", err);
    }
}

function createElementFromHTML(htmlString) {
    let div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function renderTemplate(templateName, data) {
    switch (templateName) {
        case "artistCard":
            return `
                <div class="artist-card rounded-xl bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 p-6 cursor-pointer hover:shadow-lg transition-all" data-artist-id="${data.id}">
                    <div class="text-center">
                        <div class="artist-avatar w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                            <img src="${data.cover}" alt="${data.artist}" class="w-full h-full object-cover">
                        </div>
                        <h3 class="text-lg font-bold mb-2">${data.artist}</h3>
                        <div class="genre-tag inline-block px-3 py-1 bg-blue-600 bg-opacity-30 rounded-full text-xs font-medium mb-3">${data.genre}</div>
                        <p class="text-sm opacity-70">${data.albumCount} album${data.albumCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            `;
        case "enhancedArtist":
            return `
                <div class="artistTop">
                    <div class="artist-header" id="artist-header">
                        <div class="content-wrapper">
                            <div class="artist-avatar">
                                <img src="${data.cover}" alt="${data.artist}">
                            </div>
                            <div class="artist-info">
                                <h1>${data.artist}</h1>
                                <div class="metadata-tags">
                                    <span>${data.genre}</span>
                                    <span>${data.albumCount} Albums</span>
                                    <span>${data.songCount} Songs</span>
                                </div>
                                <div class="action-buttons">
                                    <button class="play">▶️ Play All</button>
                                    <button class="follow">⭐ Follow</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content-offset">
                    <div class="similar-artists-section">
                        <h2>Similar Artists</h2>
                        <div id="similar-artists-container"></div>
                    </div>
                    <div class="albums-section">
                        <h2>Albums</h2>
                        <div id="albums-container" class="albums-grid"></div>
                    </div>
                </div>
            `;
        case "singleAlbumCard":
            return `
                <div class="album-card p-0 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-5">
                    <div class="albumFade" data-album-id="${data.albumId}">
                        <div class="gap-6 items-center md:items-start">
                            <div class="album-image relative flex-shrink-0">
                                <button class="play-album absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110">
                                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div class="flex-1 artistBottom">
                                <h3 class="text-2xl font-bold mb-2">${data.album}</h3>
                                <p class="text-sm opacity-70 mb-4">${data.year || 'Unknown year'} • ${data.songCount} Tracks</p>
                            </div>
                        </div>
                    </div>
                    <div class="songs-container" id="songs-container-${data.albumId}"></div>
                </div>
            `;
        case "songItem":
            return `
                <div class="song-item group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition cursor-pointer" data-song='${data.songData}'>
                    <div class="flex items-center flex-1 min-w-0 gap-4">
                        <span class="text-sm opacity-50 w-4 text-center">${data.trackNumber}</span>
                        <div class="truncate">
                            <p class="text-sm font-medium truncate">${data.title}</p>
                            <p class="text-xs opacity-60">${data.duration}</p>
                        </div>
                    </div>
                    <div class="song-toolbar flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="favorite" title="Add to favorites">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </button>
                        <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="play-next" title="Play next">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" /></svg>
                        </button>
                        <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="add-queue" title="Add to queue">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
                        </button>
                        <button class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10" data-action="share" title="Share">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                        </button>
                    </div>
                </div>
            `;
        default:
            return "";
    }
}




function SimilarArtistsCarousel(container) {
    this.container = container;
    this.scrollContainer = null;
    this.leftArrow = null;
    this.rightArrow = null;
    this.scrollPosition = 0;
    this.maxScroll = 0;
    this.itemWidth = 136;
    this.visibleItems = 0;
    
    this.init();
}

SimilarArtistsCarousel.prototype.init = function() {
    if (!this.container) return;
    
    this.container.innerHTML = `
        <div class="similar-artists-carousel">
            <button class="carousel-arrow left disabled" aria-label="Scroll left">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
            </button>
            <div class="similar-artists-container" id="similar-artists-scroll-container"></div>
            <button class="carousel-arrow right" aria-label="Scroll right">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
            </button>
        </div>
    `;
    
    this.scrollContainer = this.container.querySelector('#similar-artists-scroll-container');
    this.leftArrow = this.container.querySelector('.carousel-arrow.left');
    this.rightArrow = this.container.querySelector('.carousel-arrow.right');
    
    this.bindEvents();
    this.calculateDimensions();
};
SimilarArtistsCarousel.prototype.bindEvents = function() {
    let self = this;
    if (this.leftArrow) {
        this.leftArrow.addEventListener('click', function() { self.scrollLeft(); });
    }
    
    if (this.rightArrow) {
        this.rightArrow.addEventListener('click', function() { self.scrollRight(); });
    }
    
    if (this.scrollContainer) {
        this.scrollContainer.addEventListener('scroll', function() {
            self.updateArrowStates();
        });
    }
    
    window.addEventListener('resize', function() {
        self.calculateDimensions();
    });
};
SimilarArtistsCarousel.prototype.calculateDimensions = function() {
    if (!this.scrollContainer) return;
    
    let containerWidth = this.scrollContainer.parentElement.clientWidth - 100;
    this.visibleItems = Math.floor(containerWidth / this.itemWidth);
    
    let totalItems = this.scrollContainer.children.length;
    this.maxScroll = Math.max(0, (totalItems - this.visibleItems) * this.itemWidth);
    
    this.updateArrowStates();
};

SimilarArtistsCarousel.prototype.scrollLeft = function() {
    if (!this.scrollContainer) return;
    let scrollAmount = this.visibleItems * this.itemWidth;
    this.scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
};
SimilarArtistsCarousel.prototype.scrollRight = function() {
    if (!this.scrollContainer) return;
    let scrollAmount = this.visibleItems * this.itemWidth;
    this.scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
};

SimilarArtistsCarousel.prototype.updateArrowStates = function() {
    let scrollLeft = this.scrollContainer.scrollLeft;
    let scrollWidth = this.scrollContainer.scrollWidth;
    let clientWidth = this.scrollContainer.clientWidth;

    this.leftArrow.classList.toggle('disabled', scrollLeft <= 0);
    this.rightArrow.classList.toggle('disabled', scrollLeft + clientWidth >= scrollWidth - 1);
};

SimilarArtistsCarousel.prototype.addArtist = function(artistData) {
    if (!this.scrollContainer) return;
    
    let artistElement = this.createArtistCard(artistData);
    this.scrollContainer.appendChild(artistElement);
    this.calculateDimensions();
    
    this.bindArtistEvents(artistElement, artistData);
};

SimilarArtistsCarousel.prototype.createArtistCard = function(artistData) {
    let htmlString = render.artist("PopOvers", {
        artist: artistData.artist,
        id: artistData.id,
        albums: artistData.albums
    });
    
    let artistElement = create(htmlString);
    return artistElement;
};   

SimilarArtistsCarousel.prototype.bindArtistEvents = function(artistElement, artistData) {
    let hoverTimeout;
    let originalPopover = artistElement.querySelector('.artist-popover');
    let portal = document.querySelector('.popover-portal');

    if (!portal || !originalPopover) return;

    let activePopover = null;

    let showPopover = function() {
        let rect = artistElement.getBoundingClientRect();

        activePopover = originalPopover.cloneNode(true);
        activePopover.classList.add('visible');

        activePopover.style.position = 'absolute';
        activePopover.style.top = `${window.scrollY + rect.top - 12}px`;
        activePopover.style.left = `${window.scrollX + rect.left + rect.width / 2}px`;
        activePopover.style.transform = 'translate(-50%, -100%)';
        activePopover.style.zIndex = '100000000';

        portal.appendChild(activePopover);

        let seeArtistBtn = activePopover.querySelector('.popover-button');
        if (seeArtistBtn) {
            seeArtistBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (activePopover) activePopover.remove();

                let artist = window.music?.find(function(a) { return a.artist === artistData.artist; });
                if (artist) {
                    loadArtistPage(artist);
                }
            });
        }
    };

    let hidePopover = function() {
        clearTimeout(hoverTimeout);
        if (activePopover) {
            activePopover.remove();
            activePopover = null;
        }
    };

    artistElement.addEventListener('mouseenter', function() {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(showPopover, 300);
    });

    artistElement.addEventListener('mouseleave', function() {
        clearTimeout(hoverTimeout);
        setTimeout(hidePopover, 150);
    });
};

SimilarArtistsCarousel.prototype.clear = function() {
    if (this.scrollContainer) {
        this.scrollContainer.innerHTML = '';
        this.scrollPosition = 0;
        this.maxScroll = 0;
        this.updateArrowStates();
    }
};

function AlbumSelector(container, artist) {
    this.container = container;
    this.artist = artist;
    this.currentAlbumIndex = 0;
    this.albumContent = null;
    
    this.init();
}

AlbumSelector.prototype.init = function() {
    if (!this.container || !this.artist?.albums?.length) return;
    
    this.currentAlbumIndex = this.findLatestAlbumIndex();
    
    this.render();
    this.bindEvents();
};

AlbumSelector.prototype.findLatestAlbumIndex = function() {
    if (this.artist.albums.some(function(album) { return album.year; })) {
        let self = this;
        return this.artist.albums.reduce(function(latestIndex, album, index) {
            let currentYear = parseInt(album.year) || 0;
            let latestYear = parseInt(self.artist.albums[latestIndex].year) || 0;
            return currentYear > latestYear ? index : latestIndex;
        }, 0);
    }
    
    return this.artist.albums.length - 1;
};

AlbumSelector.prototype.render = function() {
    this.container.innerHTML = `
        <div class="album-selector-tabs" id="album-tabs"></div>      
        <div class="album-selector-container">
            <div class="single-album-display">
                <div class="album-content" id="album-content"></div>
            </div>
        </div>
    `;
    
    this.renderTabs();
    this.renderCurrentAlbum();
};

AlbumSelector.prototype.renderTabs = function() {
    let tabsContainer = this.container.querySelector('#album-tabs');
    if (!tabsContainer) return;
    
    let self = this;
    this.artist.albums.forEach(function(album, index) {
        let isActive = index === self.currentAlbumIndex;
        let tabElement = createElementFromHTML(`
            <button class="album-tab ${isActive ? 'active' : ''}" data-album-index="${index}">
                ${album.album}
                ${album.year ? `<span class="text-xs opacity-70 ml-1">(${album.year})</span>` : ''}
            </button>
        `);
        
        tabsContainer.appendChild(tabElement);
    });
};

AlbumSelector.prototype.bindEvents = function() {
    let tabsContainer = this.container.querySelector('#album-tabs');
    if (!tabsContainer) return;
    
    let self = this;
    tabsContainer.addEventListener('click', function(e) {
        let tabButton = e.target.closest('.album-tab');
        if (!tabButton) return;
        
        let albumIndex = parseInt(tabButton.dataset.albumIndex);
        if (albumIndex !== self.currentAlbumIndex) {
            self.switchToAlbum(albumIndex);
        }
    });
};

AlbumSelector.prototype.switchToAlbum = function(albumIndex) {
    if (albumIndex < 0 || albumIndex >= this.artist.albums.length) return;

    let albumContent = this.container.querySelector('#album-content');
    if (!albumContent) return;

    albumContent.classList.add('hideSongs');

    let self = this;
    setTimeout(function() {
        self.updateActiveTabs(albumIndex);
        self.currentAlbumIndex = albumIndex;
        self.renderCurrentAlbum();

        albumContent.classList.remove('hideSongs');
        albumContent.classList.add('showSongs');

        setTimeout(function() {
            albumContent.classList.remove('showSongs');
        }, 600);

    }, 500);
};

AlbumSelector.prototype.updateActiveTabs = function(activeIndex) {
    let tabs = this.container.querySelectorAll('.album-tab');
    tabs.forEach(function(tab, index) {
        tab.classList.toggle('active', index === activeIndex);
    });
};

AlbumSelector.prototype.renderCurrentAlbum = function() {
    let albumContent = this.container.querySelector('#album-content');
    if (!albumContent) return;

    let album = this.artist.albums[this.currentAlbumIndex];
    if (!album) return;

    let albumId = album.album.replace(/\s+/g, "-").toLowerCase();
    let albumCoverUrl = getAlbumImageUrl(album.album);

    albumContent.innerHTML = renderTemplate("singleAlbumCard", {
        album: album.album,
        cover: albumCoverUrl,
        year: album.year,
        songCount: album.songs.length,
        albumId: albumId,
    });

    let fadeContainer = document.querySelector(`.albumFade[data-album-id="${albumId}"]`);
    if (fadeContainer) {
        fadeContainer.style.setProperty('--album-cover', `url('${albumCoverUrl}')`);
    }

    let albumCoverImage = albumContent.querySelector('.album-cover');
    if (albumCoverImage) {
        let fallbackUrl = getDefaultAlbumImage();
        loadImageWithFallback(albumCoverImage, albumCoverUrl, fallbackUrl, 'album');
    }

    let songsContainer = albumContent.querySelector(`#songs-container-${albumId}`);
    if (songsContainer) {
        album.songs.forEach(function(song, index) {
            let songData = { 
                ...song, 
                artist: this.artist.artist, 
                album: album.album, 
                cover: albumCoverUrl 
            };
            let songHtml = renderTemplate("songItem", {
                trackNumber: index + 1,
                title: song.title,
                duration: song.duration,
                id: song.id,
                songData: JSON.stringify(songData).replace(/"/g, "&quot;"),
            });
            songsContainer.insertAdjacentHTML("beforeend", songHtml);
        }.bind(this));
    }

    this.bindSongEvents(albumContent);
};    

AlbumSelector.prototype.bindSongEvents = function(container) {
    container.querySelectorAll(".song-item").forEach(function(item) {
        item.addEventListener("click", function(e) {
            if (!e.target.closest(".song-toolbar")) {
                try {
                    let songData = JSON.parse(item.dataset.song);
                    playSong(songData);
                } catch (err) {
                    console.error("Failed to parse song data:", err);
                }
            }
        });
    });
    
    container.querySelectorAll(".song-toolbar button").forEach(function(button) {
        button.addEventListener("click", function(e) {
            e.stopPropagation();
            let action = button.dataset.action;
            if (action) handleToolbarAction(action, button);
        });
    });
    
    let playAlbumBtn = container.querySelector(".play-album");
    if (playAlbumBtn) {
        playAlbumBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            this.playCurrentAlbum();
        }.bind(this));
    }
};

AlbumSelector.prototype.playCurrentAlbum = function() {
    let album = this.artist.albums[this.currentAlbumIndex];
    if (!album) return;
    
    player.queue = [];
    album.songs.forEach(function(song) {
        addToQueue({ 
            ...song, 
            artist: this.artist.artist, 
            album: album.album, 
            cover: getAlbumImageUrl(album.album) 
        });
    }.bind(this));
    
    if (player.queue.length > 0) {
        playSong(player.queue.shift());
    }
};

function createPopoverPortal() {
    let portal = document.getElementById('popover-portal');
    if (!portal) {
        portal = document.createElement('div');
        portal.id = 'popover-portal';
        portal.className = 'popover-portal';
        document.body.appendChild(portal);
    }
    return portal;
}

function initializeTheme() {
    let savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
    }
    
    if (ui.elements.themeToggle) {
        ui.elements.themeToggle.removeEventListener("click", function() {});
        ui.elements.themeToggle.addEventListener("click", enhancedThemeToggle);
    }
}

function syncGlobalState() {
    window.currentSong = player.currentSong;
    window.isPlaying = player.isPlaying;
    window.currentTime = player.currentTime;
    window.duration = player.duration;
    window.queue = player.queue;
    window.recentlyPlayed = player.recentlyPlayed;
    window.favorites = player.favorites;
    window.getAlbumImageUrl = getAlbumImageUrl;
    window.getDefaultAlbumImage = getDefaultAlbumImage;
    window.loadImageWithFallback = loadImageWithFallback;
    window.formatTime = formatTime;
    window.showNotification = showNotification;
    
    window.navbarModule = {
        openNowPlayingPopup: openNowPlayingPopup,
        closeNowPlayingPopup: closeNowPlayingPopup,
        toggleDropdownMenu: toggleDropdownMenu,
        openDropdownMenu: openDropdownMenu,
        closeDropdownMenu: closeDropdownMenu,
        updateDropdownCounts: updateDropdownCounts,
        getNavbarState: getNavbarState,
        setNavbarState: setNavbarState
    };
}

function getNavbarState() {
    return {
        playlists: navbar.playlists,
        favoriteArtists: navbar.favoriteArtists
    };
}

function setNavbarState(state) {
    if (state.playlists !== undefined) navbar.playlists = state.playlists;
    if (state.favoriteArtists !== undefined) navbar.favoriteArtists = state.favoriteArtists;
}

function addNavigationToMenu() {
    let dropdownMenu = document.querySelector('#dropdown-menu');
    if (!dropdownMenu) return;
    
    if (dropdownMenu.querySelector('[data-nav="home"]')) return;
    
    let navigationSection = document.createElement('div');
    navigationSection.className = 'dropdown-section';
    navigationSection.innerHTML = `
        <h3 class="section-title">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            Navigation
        </h3>
        <div class="dropdown-item willHideMenu" data-nav="home">
            <div class="dropdown-item-icon">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            </div>
            <div class="dropdown-item-content">
                <p class="dropdown-item-title">Home</p>
                <p class="dropdown-item-subtitle">Featured music and new releases</p>
            </div>
        </div>
        <div class="dropdown-item willHideMenu" data-nav="allArtists">
            <div class="dropdown-item-icon">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
            </div>
            <div class="dropdown-item-content">
                <p class="dropdown-item-title">All Artists</p>
                <p class="dropdown-item-subtitle">Browse all artists in the library</p>
            </div>
        </div>
        <div class="dropdown-item willHideMenu" id="global-search-trigger">
            <div class="dropdown-item-icon">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="dropdown-item-content">
                <p class="dropdown-item-title">Search</p>
                <p class="dropdown-item-subtitle">Find artists, albums, and songs</p>
            </div>
        </div>
    `;
    
    let firstSection = dropdownMenu.querySelector('.dropdown-section');
    if (firstSection) {
        firstSection.after(navigationSection);
    } else {
        dropdownMenu.appendChild(navigationSection);
    }
}

function SiteMap() {
    this.routes = {
        home: {
            pattern: /^\/$/,
            handler: loadHomePage
        },
        artist: {
            pattern: /^\/artist\/(.+)$/,
            handler: function(params) {
                let artistName = params.artist || this.getParameterByName('artist', window.location.href);
                let artistData = window.music?.find(function(a) { return a.artist === artistName; });
                if (artistData) {
                    loadArtistPage(artistData);
                } else {
                    this.navigateTo('home');
                }
            }.bind(this)
        },
        allArtists: {
            pattern: /^\/artists$/,
            handler: loadAllArtistsPage
        }
    };
    
    this.handleInitialRoute();
    
    window.addEventListener('popstate', function(event) {
        this.handleRoute(window.location.pathname + window.location.search);
    }.bind(this));
    
    this.bindNavigationEvents();
}

SiteMap.prototype.handleInitialRoute = function() {
    let path = window.location.pathname + window.location.search;
    this.handleRoute(path);
};

SiteMap.prototype.handleRoute = function(path) {
    let matchedRoute = false;
    
    for (let key in this.routes) {
        let route = this.routes[key];
        let match = path.match(route.pattern);
        
        if (match) {
            let params = {};
            
            if (key === 'artist') {
                params.artist = decodeURIComponent(match[1]);
            }
            
            route.handler(params);
            matchedRoute = true;
            break;
        }
    }
    
    if (!matchedRoute) {
        loadHomePage();
    }
};

SiteMap.prototype.navigateTo = function(routeName, params = {}) {
    let url;
    
    switch (routeName) {
        case 'home':
            url = '/';
            break;
        case 'artist':
            url = `/artist/${encodeURIComponent(params.artist)}`;
            break;
        case 'allArtists':
            url = '/artists';
            break;
        default:
            url = '/';
    }
    
    window.history.pushState({}, '', url);
    
    if (this.routes[routeName]) {
        this.routes[routeName].handler(params);
    }
};

SiteMap.prototype.getParameterByName = function(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    let results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

SiteMap.prototype.bindNavigationEvents = function() {
    this.bindNavigationEvents = function() {
    };
    
    document.addEventListener('click', function(e) {
        if (e.target.id === 'global-search-trigger') {
            this.openSearchDialog();
        }
    }.bind(this));
};

SiteMap.prototype.openSearchDialog = function() {
    if (!document.getElementById('search-dialog')) {
        let searchDialog = document.createElement('div');
        searchDialog.id = 'search-dialog';
        searchDialog.className = 'search-dialog hidden';
        
        searchDialog.innerHTML = `
            <div class="search-dialog-content rounded-md shadow-xl overflow-hidden">
                <form id="global-search-form" class="relative">
                    <input type="text" id="global-search-input" placeholder="Search for artists, albums, or songs..." 
                           class="w-full py-4 px-5 text-lg text-fg-default bg-bg-subtle border-none focus:outline-none focus:ring-0">
                    <button type="submit" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-accent-primary hover:bg-accent-secondary text-white p-2 rounded-md">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </form>
                
                <div class="recent-searches px-5 py-4 border-t border-border-muted">
                    <h3 class="text-sm font-medium text-fg-muted mb-2">Recent Searches</h3>
                    <div id="recent-searches-list" class="space-y-2">
                        <p class="text-sm text-fg-subtle">No recent searches</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchDialog);
        
        searchDialog.addEventListener('click', function(e) {
            if (e.target === searchDialog) {
                this.closeSearchDialog();
            }
        }.bind(this));
        
        let searchForm = document.getElementById('global-search-form');
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let query = document.getElementById('global-search-input').value.trim();
            if (query) {
                this.closeSearchDialog();
                this.navigateTo('search', { query });
                this.addRecentSearch(query);
            }
        }.bind(this));
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !document.getElementById('search-dialog').classList.contains('hidden')) {
                this.closeSearchDialog();
            }
        }.bind(this));
        
        this.updateRecentSearchesList();
    }
    
    let dialog = document.getElementById('search-dialog');
    dialog.classList.remove('hidden');
    dialog.classList.add('search-dialog-opening');
    
    setTimeout(function() {
        dialog.classList.remove('search-dialog-opening');
    }, 400);
    
    document.body.style.overflow = 'hidden';
};

SiteMap.prototype.closeSearchDialog = function() {
    let dialog = document.getElementById('search-dialog');
    if (dialog && !dialog.classList.contains('hidden')) {
        dialog.classList.add('search-dialog-closing');
        
        setTimeout(function() {
            dialog.classList.remove('search-dialog-closing');
            dialog.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
};

SiteMap.prototype.addRecentSearch = function(query) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    
    recentSearches = recentSearches.filter(function(item) { return item !== query; });
    
    recentSearches.unshift(query);
    
    recentSearches = recentSearches.slice(0, 5);
    
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    
    this.updateRecentSearchesList();
};

SiteMap.prototype.updateRecentSearchesList = function() {
    let list = document.getElementById('recent-searches-list');
    if (!list) return;
    
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    
    if (recentSearches.length === 0) {
        list.innerHTML = `<p class="text-sm text-fg-subtle">No recent searches</p>`;
        return;
    }
    
    list.innerHTML = recentSearches.map(function(query) {
        return `
            <div class="recent-search-item flex justify-between items-center group">
                <button class="recent-search-btn text-sm py-1 text-fg-default hover:text-accent-primary flex-grow text-left truncate" data-query="${query}">
                    <span class="inline-block mr-2 opacity-60">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </span>
                    ${query}
                </button>
                <button class="remove-search-btn p-1.5 opacity-0 group-hover:opacity-100 transition-opacity" data-query="${query}">
                    <svg class="w-3.5 h-3.5 text-fg-muted hover:text-fg-default" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
    
    list.querySelectorAll('.recent-search-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            let query = btn.dataset.query;
            this.closeSearchDialog();
            this.navigateTo('search', { query });
        }.bind(this));
    }.bind(this));
    
    list.querySelectorAll('.remove-search-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            let query = btn.dataset.query;
            
            let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            recentSearches = recentSearches.filter(function(item) { return item !== query; });
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
            
            this.updateRecentSearchesList();
        }.bind(this));
    }.bind(this));
};

function initializeApp() {
    try {
        initializeMusicLibrary();
        
        initUIElements();
        initNavbarElements();
        initNowPlayingPopup();
        
        addNavigationToMenu();
        
        bindUIEvents();
        bindNavbarEvents();
        
        initPlayer();
        
        loadHomePage();
        initializeTheme();
        createPopoverPortal();
        
        let nowPlayingArea = document.getElementById("now-playing-area");
        if (nowPlayingArea) {
            nowPlayingArea.classList.remove("has-song");
        }
        
        updateDropdownCounts();
        syncGlobalState();
        
        console.log("Enhanced Music Player initialized successfully");
    } catch (error) {
        console.error("Enhanced initialization failed:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.siteMap = new SiteMap();
    initializeApp();
});





function updateQueueTab() {
    if (!nowPlayingPopup.elements.queueList) return;
    
    if (player.queue.length === 0) {
        nowPlayingPopup.elements.queueList.innerHTML = '<li class="empty-state">No songs in queue</li>';
        return;
    }

    nowPlayingPopup.elements.queueList.innerHTML = player.queue.map(function(song, index) {
        let isCurrentSong = player.currentSong && song.id === player.currentSong.id;
        return `
            <li class="popup-song-item ${isCurrentSong ? 'playing' : ''}" data-index="${index}">
                <img class="popup-song-cover" src="${song.cover || getAlbumImageUrl(song.album)}" alt="${song.title}">
                <div class="popup-song-info">
                    <div class="popup-song-title">${song.title}</div>
                    <div class="popup-song-artist">${song.artist}</div>
                </div>
                <div class="popup-song-duration">${song.duration || '0:00'}</div>
            </li>
        `;
    }).join('');

    nowPlayingPopup.elements.queueList.querySelectorAll('.popup-song-item').forEach(function(item, index) {
        item.addEventListener('click', function() {
            playFromQueue(index);
        });
    });
}

function updateRecentTab() {
    if (!nowPlayingPopup.elements.recentList) return;
    
    if (player.recentlyPlayed.length === 0) {
        nowPlayingPopup.elements.recentList.innerHTML = '<li class="empty-state">No recently played songs</li>';
        return;
    }

    nowPlayingPopup.elements.recentList.innerHTML = player.recentlyPlayed.map(function(song, index) {
        let isCurrentSong = player.currentSong && song.id === player.currentSong.id;
        return `
            <li class="popup-song-item ${isCurrentSong ? 'playing' : ''}" data-index="${index}">
                <img class="popup-song-cover" src="${song.cover || getAlbumImageUrl(song.album)}" alt="${song.title}">
                <div class="popup-song-info">
                    <div class="popup-song-title">${song.title}</div>
                    <div class="popup-song-artist">${song.artist}</div>
                </div>
                <div class="popup-song-duration">${song.duration || '0:00'}</div>
            </li>
        `;
    }).join('');

    nowPlayingPopup.elements.recentList.querySelectorAll('.popup-song-item').forEach(function(item, index) {
        item.addEventListener('click', function() {
            playFromRecent(index);
        });
    });
}

export { getArtistImageUrl, getTotalSongs };
