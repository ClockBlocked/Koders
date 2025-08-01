
import { getArtistImageUrl, getTotalSongs } from './global.js';

// FileName:  "blocks.js"
export const render = {
  artist: function(templateName, data) {
    switch (templateName) {
     case "PopOvers":
        return `

<div class="similar-artist-card" data-artist-name="${data.artist}">
  <div class="similar-artist-image">
    <img src="${getArtistImageUrl(data.artist)}" alt="${data.artist}" class="w-full h-full object-cover artist-avatar">
    <div class="artist-image-overlay"></div>
  </div>
  <div class="similar-artist-name">${data.artist}</div>
  <div class="artist-popover">
    <div class="popover-header">
      <div class="popover-artist-name">${data.artist}</div>
    </div>
    <div class="popover-stats">
      <div class="stat-item">
        <span class="stat-value">${data.albums?.length || 0}</span>
        <span class="stat-label">Albums</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${getTotalSongs(data) || 0}</span>
        <span class="stat-label">Songs</span>
      </div>
    </div>
    <div class="popover-footer">
      <button class="popover-button" data-artist-id="${data.id}">
        View Artist
      </button>
    </div>
  </div>
</div>
        `;        
      default:
        return "";
    }
  }
};"";
    }
  }
};
