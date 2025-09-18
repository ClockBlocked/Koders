



/**
// utilities/templates.js
import { ICONS } from '../map.js';
import { utils, appState } from '../global.js'; // adjust if these are exported elsewhere

export const toDataJSON = (obj) => JSON.stringify(obj).replaceAll('"', '&quot;');

export const create = (html) => {
  const t = document.createElement('template');
  t.innerHTML = String(html).trim();
  return t.content.firstElementChild;
};

const songItem = ({
  trackNumber = 1,
  title = 'Untitled',
  artist = '',
  duration = '--:--',
  songData = {},
  context = 'generic',
  isFavorite = false,
  showTrackNumber = true
}) => {
  const safeSong = {
    id: songData.id ?? String(Date.now()),
    title,
    duration,
    artist,
    album: songData.album ?? '',
    cover: utils.getAlbumImageUrl(songData.album ?? '')
  };

  const fav = appState?.favorites?.songs?.has?.(safeSong.id) ?? isFavorite;

  return `
    <div class="song-item"
         role="button"
         tabindex="0"
         data-context="${context}"
         data-song='${toDataJSON(safeSong)}'
         aria-label="Track ${trackNumber}: ${title} — ${duration}">
      <div class="cell index-play" aria-hidden="false">
        <span class="track-number">${showTrackNumber ? trackNumber : '♪'}</span>
        <button aria-label="Name" class="play-button" data-action="play" title="Play" aria-label="Play ${title}" tabindex="-1">
          <svg class="global lightGray small" viewBox="0 0 384 512" aria-hidden="true">
            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
          </svg>
        </button>
      </div>
      <div class="cell title" title="${title}">
        <span class="song-title">${title}</span>
      </div>
      <div class="cell duration" aria-label="Duration ${duration}">
        <span>${duration}</span>
      </div>
      <div class="cell heart">
        <button aria-label="Name" class="action-btn favorite-btn ${fav ? 'favorited' : ''}"
                data-action="favorite"
                data-song-id="${safeSong.id}"
                aria-pressed="${fav ? 'true' : 'false'}"
                aria-label="Toggle favorite for ${title}">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="fill: ${fav ? '#ef4444' : 'none'};" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>
      <div class="cell more">
        <button aria-label="Name" class="action-btn more-btn" data-action="more" data-song-id="${safeSong.id}" title="More options" aria-label="More options for ${title}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm0 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
};

const albumCard = ({ album, index = 0 }) => `
  <div class="album-card" style="animation-delay: ${index * 100}ms;"
       data-artist="${album.artist}"
       data-album="${album.album}">
    <div class="album-cover-wrap">
      <img src="${utils.getAlbumImageUrl(album.album)}" alt="${album.album}" class="album-cover">
      <div class="album-overlay">
        <button aria-label="Name" class="album-play-btn" data-action="play-album" data-artist="${album.artist}" data-album="${album.album}" title="Play ${album.album}">
          ${ICONS.play}
        </button>
      </div>
    </div>
    <div class="album-info">
      <div class="album-title" title="${album.album}">${album.album}</div>
      <button aria-label="Name" class="album-artist link-quiet" data-action="goto-artist" data-artist="${album.artist}" title="Go to ${album.artist}">
        ${album.artist}
      </button>
    </div>
  </div>
`;

const artistCard = ({ name, index = 0 }) => `
  <div class="artist-card" data-artist="${name}" style="animation-delay: ${index * 100}ms;">
    <div class="artist-image">
      <img src="${utils.getArtistImageUrl(name)}" alt="${name}" class="artist-avatar">
      <div class="play-button-overlay">${ICONS.play}</div>
    </div>
    <div class="artist-name" title="${name}">${name}</div>
  </div>
`;

const playlistCard = ({ playlist, index = 0 }) => `
  <div class="playlist-card" data-playlist-id="${playlist.id}" style="animation-delay: ${index * 100}ms;">
    <div class="playlist-icon">
      <svg viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">
        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
      </svg>
    </div>
    <div class="playlist-info">
      <div class="playlist-name" title="${playlist.name}">${playlist.name}</div>
      <div class="playlist-tracks">${playlist.songs?.length ?? 0} track${(playlist.songs?.length ?? 0) === 1 ? '' : 's'}</div>
    </div>
    <div class="play-button-overlay">${ICONS.play}</div>
  </div>
`;

const emptyState = (message, iconPath) => `
  <div class="empty-state">
    <svg viewBox="0 0 24 24" class="w-12 h-12 mb-3 opacity-50" aria-hidden="true">${iconPath}</svg>
    <p>${message}</p>
  </div>
`;

export const render = { songItem, albumCard, artistCard, playlistCard, emptyState };

// alias for backwards compatibility
export const TPL = render;
*****/

























































































































































































/**
 * 
 *
 *
 *
 *
 *
(function () {
  const toDataJSON = (obj) => JSON.stringify(obj).replaceAll('"', '&quot;');

  const songRow = (args) => {
    const song = args.song || {};
    const index = args.index ?? 0;
    const showTrackNumber = args.showTrackNumber !== false;
    const context = args.context || 'generic';
    const trackNumber = index + 1;
    const title = song.title || 'Untitled';
    const duration = song.duration || '--:--';
    const isFavorite = Boolean(appState && appState.favorites && appState.favorites.songs && appState.favorites.songs.has && appState.favorites.songs.has(song.id));
    const songData = {
      id: song.id,
      title: title,
      duration: duration,
      artist: song.artist,
      album: song.album,
      cover: utils.getAlbumImageUrl(song.album)
    };

    return (
      '<div class="song-item" role="button" tabindex="0" ' +
      'data-context="' + context + '" ' +
      'data-song="' + toDataJSON(songData) + '" ' +
      'aria-label="Track ' + trackNumber + ': ' + title + ' — ' + duration + '">' +

        '<div class="cell index-play" aria-hidden="false">' +
          '<span class="track-number">' + (showTrackNumber ? trackNumber : '♪') + '</span>' +
          '<button aria-label="Name" class="play-button" data-action="play" title="Play" aria-label="Play ' + title + '" tabindex="-1">' +
            '<svg class="global lightGray small" viewBox="0 0 384 512" aria-hidden="true">' +
              '<path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +

        '<div class="cell title" title="' + title + '">' +
          '<span class="song-title">' + title + '</span>' +
        '</div>' +

        '<div class="cell duration" aria-label="Duration ' + duration + '">' +
          '<span>' + duration + '</span>' +
        '</div>' +

        '<div class="cell heart">' +
          '<button aria-label="Name" class="action-btn favorite-btn ' + (isFavorite ? 'favorited' : '') + '" ' +
                  'data-action="favorite" ' +
                  'data-song-id="' + song.id + '" ' +
                  'title="' + (isFavorite ? 'Remove from favorites' : 'Add to favorites') + '" ' +
                  'aria-pressed="' + (isFavorite ? 'true' : 'false') + '" ' +
                  'aria-label="Toggle favorite for ' + title + '">' +
            '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="fill: ' + (isFavorite ? '#ef4444' : 'none') + ';" aria-hidden="true">' +
              '<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +

        '<div class="cell more">' +
          '<button aria-label="Name" class="action-btn more-btn" ' +
                  'data-action="more" ' +
                  'data-song-id="' + song.id + '" ' +
                  'title="More options" ' +
                  'aria-label="More options for ' + title + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true">' +
              '<path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm0 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +

      '</div>'
    );
  };

  const albumCard = (args) => {
    const album = args.album || {};
    const index = args.index || 0;
    const artist = album.artist || '';
    const name = album.album || '';

    return (
      '<div class="album-card" style="animation-delay: ' + (index * 100) + 'ms;" data-artist="' + artist + '" data-album="' + name + '">' +
        '<div class="album-cover-wrap">' +
          '<img src="' + utils.getAlbumImageUrl(name) + '" alt="' + name + '" class="album-cover">' +
          '<div class="album-overlay">' +
            '<button aria-label="Name" class="album-play-btn" data-action="play-album" data-artist="' + artist + '" data-album="' + name + '" title="Play ' + name + '">' +
              ICONS.play +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="album-info">' +
          '<div class="album-title" title="' + name + '">' + name + '</div>' +
          '<button aria-label="Name" class="album-artist link-quiet" data-action="goto-artist" data-artist="' + artist + '" title="Go to ' + artist + '">' +
            artist +
          '</button>' +
        '</div>' +
      '</div>'
    );
  };

  const artistCard = (args) => {
    const name = args.name || '';
    const index = args.index || 0;

    return (
      '<div class="artist-card" data-artist="' + name + '" style="animation-delay: ' + (index * 100) + 'ms;">' +
        '<div class="artist-image">' +
          '<img src="' + utils.getArtistImageUrl(name) + '" alt="' + name + '" class="artist-avatar">' +
          '<div class="play-button-overlay">' + ICONS.play + '</div>' +
        '</div>' +
        '<div class="artist-name" title="' + name + '">' + name + '</div>' +
      '</div>'
    );
  };

  const playlistCard = (args) => {
    const playlist = args.playlist || {};
    const index = args.index || 0;
    const name = playlist.name || '';
    const count = (playlist.songs && playlist.songs.length) ? playlist.songs.length : 0;

    return (
      '<div class="playlist-card" data-playlist-id="' + playlist.id + '" style="animation-delay: ' + (index * 100) + 'ms;">' +
        '<div class="playlist-icon">' +
          '<svg viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">' +
            '<path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>' +
          '</svg>' +
        '</div>' +
        '<div class="playlist-info">' +
          '<div class="playlist-name" title="' + name + '">' + name + '</div>' +
          '<div class="playlist-tracks">' + count + ' track' + (count === 1 ? '' : 's') + '</div>' +
        '</div>' +
        '<div class="play-button-overlay">' + ICONS.play + '</div>' +
      '</div>'
    );
  };

  const emptyState = (message, iconPath) => {
    return (
      '<div class="empty-state">' +
        '<svg viewBox="0 0 24 24" class="w-12 h-12 mb-3 opacity-50" aria-hidden="true">' +
          iconPath +
        '</svg>' +
        '<p>' + message + '</p>' +
      '</div>'
    );
  };

  const TPL = {
    songRow: songRow,
    albumCard: albumCard,
    artistCard: artistCard,
    playlistCard: playlistCard,
    emptyState: emptyState
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TPL: TPL, toDataJSON: toDataJSON };
  } else {
    window.TPL = TPL;
    window.toDataJSON = toDataJSON;
  }
})();
*
*
*
*
*
**/









































































































import { getAlbumImageUrl } from './parsers.js';





export const render = {
  artist: function(templateName, data) {
    switch(templateName) {
      case "PopOvers":
        const artistName = data.artist;
        const artistId = data.id || '';
        const artistImage = getArtistImageUrl(artistName);
        const totalAlbums = data.albums?.length || 0;
        const totalSongs = getTotalSongs(data) || 0;

        return `
<div class="similar-artist-card" data-artist-name="${artistName}">
  <div class="similar-artist-image">
    <img 
      src="${artistImage}" 
      alt="${artistName}" 
      class="w-full h-full object-cover artist-avatar"
    />
    <div class="artist-image-overlay"></div>
  </div>
  
  <div class="similar-artist-name">
    ${artistName}
  </div>
  
  <div class="artist-popover">
    <div class="popover-header">
      <div class="popover-artist-name">${artistName}</div>
    </div>
    
    <div class="popover-stats">
      <div class="stat-item">
        <span class="stat-value">${totalAlbums}</span>
        <span class="stat-label">Albums</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${totalSongs}</span>
        <span class="stat-label">Songs</span>
      </div>
    </div>
    
    <div class="popover-footer">
      <button aria-label="Name" class="popover-button" data-artist-id="${artistId}">
        View Artist
      </button>
    </div>
  </div>
</div>`;
      
      case "card":
        return `
          <div class="artist-card rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 cursor-pointer hover:shadow-lg transition-all hover:bg-white/10" data-artist-id="${data.id}">
            <div class="text-center">
              <div class="artist-avatar w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                <img src="${data.cover}" alt="${data.artist}" class="w-full h-full object-cover">
              </div>
              <h3 class="text-lg font-bold mb-2 text-white">${data.artist}</h3>
              <div class="genre-tag inline-block px-3 py-1 bg-blue-600/30 rounded-full text-xs font-medium mb-3 text-blue-200">${data.genre}</div>
              <p class="text-sm opacity-70 text-gray-300">${data.albumCount} album${data.albumCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        `;
      
      case "header":
        return `
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
                  <button aria-label="Name" class="play">Play All</button>
                  <button aria-label="Name" class="follow"
                          data-favorite-artists="${data.songData.id}">Favorite</button>
                </div>
              </div>
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
                    <button aria-label="Name" class="play">Play All</button>
                    <button aria-label="Name" class="follow">Favorite</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="content-offset">
            <div class="artistAlbums">
              <div id="albumWrapper" class="albums-grid"></div>
            </div>
            
            <div class="similar-artists-section">
              <div id="similar-artists-container"></div>
            </div>
          </div>
        `;
        
      default:
        return "";
    }
  },
  
  album: function(templateName, data) {
    switch (templateName) {
      case "card":
        return `
          <div class="album-card">
            <div class="albumFade" data-album-id="${data.albumId}">
              <div class="gap-6 items-center md:items-start">
                <div class="album-image relative flex-shrink-0">
                  <img src="${data.cover}" alt="${data.album}" class="album-cover w-full h-full object-cover">
                  <button aria-label="Name" class="play-album absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                  </button>
          <div class="albumMetadata">
                  <h3 class="metaAlbumName">${data.album}</h3>
                  <p class="metaAlbumYear">${data.year || 'Unknown year'} • ${data.songCount} Tracks</p>
                </div>
      
                </div>
              </div>
            
            <div class="songs-container" id="songs-container-${data.albumId}"></div>
          </div></div>
        `;
      
      case "singleAlbumCard":
        return `
          <div class="album-card p-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
            <div class="albumFade" data-album-id="${data.albumId}">
              <div class="gap-6 items-center md:items-start">
                <div class="album-image relative flex-shrink-0">
                  <button aria-label="Name" class="play-album absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <h3 class="text-2xl font-bold mb-2 text-white">${data.album}</h3>
                  <p class="text-sm opacity-70 mb-4 text-gray-300">${data.year || 'Unknown year'} • ${data.songCount} Tracks</p>
                </div>
              </div>
            </div>
            <div class="songs-container" id="songs-container-${data.albumId}"></div>
          </div>
        `;
        
      default:
        return "";
    }
  },
  
  songItem: function(data) {
    const { 
      trackNumber, 
      title, 
      artist, 
      duration, 
      songData, 
      context = 'base',
      isFavorite = false,
      showTrackNumber = true,
      showArtist = false,
      albumCover = null
    } = data;
    
    return `
  <div class="song-item"
       data-song='${JSON.stringify(songData).replace(/"/g, "&quot;")}'
       data-context="${context}"
       role="button"
       tabindex="0"
       aria-label="Track ${trackNumber}: ${title} — ${duration}">

    <!-- 1) LEFT: Track # (replaced by Play on hover) -->
    <div class="cell index-play" aria-hidden="false">
      <span class="track-number">
        ${showTrackNumber ? trackNumber : '♪'}
      </span>

      <button aria-label="Name" class="play-button"
              data-action="play"
              title="Play"
              aria-label="Play ${title}"
              tabindex="-1">
        <!-- Play Icon -->
        <svg class="global lightGray small" viewBox="0 0 384 512" aria-hidden="true">
          <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
        </svg>
      </button>
    </div>

    <!-- 2) Song Name -->
    <div class="cell title" title="${title}">
      <span class="song-title">${title}</span>
    </div>

    <!-- 3) Duration -->
    <div class="cell duration" aria-label="Duration ${duration}">
      <span>${duration}</span>
    </div>

    <!-- 4) Heart -->
    <div class="cell heart">
      <button aria-label="Name" class="action-btn favorite-btn ${isFavorite ? 'favorited' : ''}"
              data-action="favorite"
              data-song-id="${songData.id}"
              data-favorite-songs="${data.songData.id}"
              title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
              aria-pressed="${isFavorite ? 'true' : 'false'}"
              aria-label="Toggle favorite for ${title}">
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
             style="fill: ${isFavorite ? '#ef4444' : 'none'};" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>
    </div>

    <!-- 5) More (three dots) -->
    <div class="cell more">
      <button aria-label="Name" class="action-btn more-btn"
              data-action="more"
              title="More options"
              aria-label="More options for ${title}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm0 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>
        </svg>
      </button>
    </div>
  </div>

    `;
  },
  
  track: function(templateName, data) {
    switch (templateName) {
      case "row":
      case "songItem":
        return render.songItem({
          trackNumber: data.trackNumber,
          title: data.title,
          artist: data.songData?.artist,
          duration: data.duration,
          songData: data.songData,
          context: data.actionSet || 'base',
          isFavorite: data.isFavorite || false,
          showTrackNumber: true,
          showArtist: false
        });
        
      case "nowPlaying":
        return `
          <div class="now-playing-card bg-white/5 rounded-lg p-4 backdrop-blur-sm">
            <div class="flex items-center gap-4">
              <div class="album-art flex-shrink-0">
                <img src="${data.songData.cover}" alt="${data.songData.album}" class="w-16 h-16 rounded-lg object-cover">
              </div>
              <div class="track-info flex-1 min-w-0">
                <h3 class="track-title font-semibold text-white truncate">${data.title}</h3>
                <p class="track-artist text-gray-400 text-sm truncate cursor-pointer hover:text-white transition-colors" data-artist="${data.songData.artist}">${data.songData.artist}</p>
                <p class="track-album text-gray-500 text-xs truncate">${data.songData.album}</p>
              </div>
            </div>
            <div class="progress-container mt-4">
              <div class="progress-bar w-full bg-gray-700 rounded-full h-2 mb-2">
                <div class="progress-fill bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${data.progress || 0}%"></div>
              </div>
              <div class="time-display flex justify-between text-xs text-gray-400">
                <span class="current-time">${formatTime(data.currentTime || 0)}</span>
                <span class="duration">${formatTime(data.duration || 0)}</span>
              </div>
            </div>
          </div>
        `;
        
      default:
        return "";
    }
  },
  
  page: function(templateName, data) {
    switch (templateName) {
      case "home":
        return `
          <div class="text-center py-8 md:py-12">
            <h1 class="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Discover Amazing Music</h1>
            <p class="text-lg md:text-xl text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto">Explore artists, albums, and songs from your personal library with an immersive listening experience</p>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 px-4 text-white">Featured Artists</h2>
          <div id="featured-artists" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 px-4"></div>
        `;
        
      case "allArtists":
        return `
          <div class="page-header px-4 sm:px-6 py-4">
            <div class="filter-controls mb-6 flex flex-wrap gap-4 items-center">
              <div class="search-wrapper relative flex-grow max-w-md">
                <input type="text" id="artist-search" 
                      class="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Search artists...">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div id="genre-filters" class="genre-filters flex flex-wrap gap-2"></div>
              <div class="view-toggle ml-auto">
                <button aria-label="Name" id="grid-view-btn" class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                </button>
                <button aria-label="Name" id="list-view-btn" class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div id="artists-grid" class="artists-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6"></div>
        `;
        
      default:
        return "";
    }
  }
};


// templates.js
/**
export const TPL = (() => {
  // Reuse your beautiful .song-item row for lists (recent, favorites, etc.)
  const songRow = ({ song, index, showTrackNumber = true, context = 'generic' }) => {
    const trackNumber = index + 1;
    const title = song.title ?? 'Untitled';
    const duration = song.duration ?? '--:--';
    const isFavorite = Boolean(appState?.favorites?.songs?.has?.(song.id));
    const songData = {
      id: song.id,
      title,
      duration,
      artist: song.artist,
      album: song.album,
      cover: utils.getAlbumImageUrl(song.album),
    };

    return `
      <div class="song-item"
           role="button"
           tabindex="0"
           data-context="${context}"
           data-song='${toDataJSON(songData)}'
           aria-label="Track ${trackNumber}: ${title} — ${duration}">

        <!-- 1) #/Play -->
        <div class="cell index-play" aria-hidden="false">
          <span class="track-number">${showTrackNumber ? trackNumber : '♪'}</span>

          <button aria-label="Name" class="play-button"
                  data-action="play"
                  title="Play"
                  aria-label="Play ${title}"
                  tabindex="-1">
            <svg class="global lightGray small" viewBox="0 0 384 512" aria-hidden="true">
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
            </svg>
          </button>
        </div>

        <!-- 2) Title -->
        <div class="cell title" title="${title}">
          <span class="song-title">${title}</span>
        </div>

        <!-- 3) Duration -->
        <div class="cell duration" aria-label="Duration ${duration}">
          <span>${duration}</span>
        </div>

        <!-- 4) Heart -->
        <div class="cell heart">
          <button aria-label="Name" class="action-btn favorite-btn ${isFavorite ? 'favorited' : ''}"
                  data-action="favorite"
                  data-song-id="${song.id}"
                  title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                  aria-pressed="${isFavorite ? 'true' : 'false'}"
                  aria-label="Toggle favorite for ${title}">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                style="fill: ${isFavorite ? '#ef4444' : 'none'};" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>

        <!-- 5) More -->
        <div class="cell more">
          <button aria-label="Name" class="action-btn more-btn"
                  data-action="more"
                  data-song-id="${song.id}"
                  title="More options"
                  aria-label="More options for ${title}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm0 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  };

  // Small cards/grids
  const albumCard = ({ album, index }) => `
    <div class="album-card" style="animation-delay: ${index * 100}ms;"
         data-artist="${album.artist}"
         data-album="${album.album}">
      <div class="album-cover-wrap">
        <img src="${utils.getAlbumImageUrl(album.album)}" alt="${album.album}" class="album-cover">
        <div class="album-overlay">
          <button aria-label="Name" class="album-play-btn"
                  data-action="play-album"
                  data-artist="${album.artist}"
                  data-album="${album.album}"
                  title="Play ${album.album}">
            ${ICONS.play}
          </button>
        </div>
      </div>
      <div class="album-info">
        <div class="album-title" title="${album.album}">${album.album}</div>
        <button aria-label="Name" class="album-artist link-quiet" data-action="goto-artist" data-artist="${album.artist}" title="Go to ${album.artist}">
          ${album.artist}
        </button>
      </div>
    </div>
  `;

  const artistCard = ({ name, index }) => `
    <div class="artist-card" data-artist="${name}" style="animation-delay: ${index * 100}ms;">
      <div class="artist-image">
        <img src="${utils.getArtistImageUrl(name)}" alt="${name}" class="artist-avatar">
        <div class="play-button-overlay">${ICONS.play}</div>
      </div>
      <div class="artist-name" title="${name}">${name}</div>
    </div>
  `;

  const playlistCard = ({ playlist, index }) => `
    <div class="playlist-card" data-playlist-id="${playlist.id}" style="animation-delay: ${index * 100}ms;">
      <div class="playlist-icon">
        <svg viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
        </svg>
      </div>
      <div class="playlist-info">
        <div class="playlist-name" title="${playlist.name}">${playlist.name}</div>
        <div class="playlist-tracks">${playlist.songs?.length ?? 0} track${(playlist.songs?.length ?? 0) === 1 ? '' : 's'}</div>
      </div>
      <div class="play-button-overlay">${ICONS.play}</div>
    </div>
  `;

  const emptyState = (message, iconPath) => `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" class="w-12 h-12 mb-3 opacity-50" aria-hidden="true">
        ${iconPath}
      </svg>
      <p>${message}</p>
    </div>
  `;

  return { songRow, albumCard, artistCard, playlistCard, emptyState };
})();
**/

export function create(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}
