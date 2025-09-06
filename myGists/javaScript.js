const GistLibrary = (() => {
  'use strict';

  // Gist data structure - nested array for categorization
  const gistDatabase = {
    javascript: [
      {
        id: '6484570001',
        title: 'Web Page Debugging Script',
        description: 'Developer Options Console Log',
        language: 'javascript',
        category: 'debug',
        extension: '.js',
        dateCreated: new Date('2024-01-15').toISOString(),
        dateModified: new Date('2024-01-20').toISOString(),
        tags: ['debugging', 'console', 'development'],
        views: 342,
        downloads: 89,
        code: `// Advanced Console Logger
const debugLogger = {
  enabled: localStorage.getItem('debugMode') === 'true',
  
  log: function(message, type = 'info') {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    const styles = {
      info: 'color: #61afef',
      warn: 'color: #e5c07b',
      error: 'color: #e06c75',
      success: 'color: #98c379'
    };
    
    console.log(\`%c[\${timestamp}] \${message}\`, styles[type] || styles.info);
    this.saveToHistory({ timestamp, message, type });
  },
  
  saveToHistory: function(entry) {
    const history = JSON.parse(localStorage.getItem('debugHistory') || '[]');
    history.push(entry);
    if (history.length > 100) history.shift();
    localStorage.setItem('debugHistory', JSON.stringify(history));
  }
};`
      }
    ],
    python: [],
    css: [],
    html: [],
    php: [],
    sql: [],
    react: [],
    vue: []
  };

  // LocalStorage management
  const Storage = {
    KEYS: {
      FAVORITES: 'gistSaves',
      PREFERENCES: 'gistPreferences',
      RECENT_VIEWS: 'gistRecentViews',
      USER_GISTS: 'userGists'
    },

    get: function(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || '[]');
      } catch (e) {
        console.error('Storage.get error:', e);
        return [];
      }
    },

    set: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Storage.set error:', e);
        return false;
      }
    },

    addToArray: function(key, item) {
      const arr = this.get(key);
      if (!arr.find(i => i.id === item.id)) {
        arr.push(item);
        return this.set(key, arr);
      }
      return false;
    },

    removeFromArray: function(key, itemId) {
      const arr = this.get(key);
      const filtered = arr.filter(i => i.id !== itemId);
      return this.set(key, filtered);
    },

    isFavorite: function(gistId) {
      const favorites = this.get(this.KEYS.FAVORITES);
      return favorites.some(fav => fav.id === gistId);
    }
  };

  // Code highlighting with Prism fallback
  const CodeHighlighter = {
    highlight: function(code, language) {
      if (typeof Prism !== 'undefined' && Prism.languages[language]) {
        return Prism.highlight(code, Prism.languages[language], language);
      }
      return this.escapeHtml(code);
    },

    escapeHtml: function(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }
  };

  // File operations
  const FileManager = {
    generateFilename: function(gist) {
      const date = new Date().toISOString().split('T')[0];
      const sanitized = gist.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      return `${sanitized}_${date}${gist.extension}`;
    },

    download: function(gist) {
      try {
        const blob = new Blob([gist.code], { 
          type: this.getMimeType(gist.extension) 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = this.generateFilename(gist);
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        // Track download
        this.trackDownload(gist);
        return true;
      } catch (e) {
        console.error('Download failed:', e);
        return false;
      }
    },

    getMimeType: function(extension) {
      const types = {
        '.js': 'application/javascript',
        '.py': 'text/x-python',
        '.css': 'text/css',
        '.html': 'text/html',
        '.php': 'application/x-httpd-php',
        '.sql': 'application/sql',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.md': 'text/markdown',
        '.txt': 'text/plain'
      };
      return types[extension] || 'text/plain';
    },

    trackDownload: function(gist) {
      // Update download count in database
      const category = gistDatabase[gist.language];
      const gistIndex = category.findIndex(g => g.id === gist.id);
      if (gistIndex !== -1) {
        category[gistIndex].downloads++;
      }
    }
  };

  // Clipboard operations
  const ClipboardManager = {
    copy: async function(text) {
      // Modern approach with fallback
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (err) {
          console.warn('Clipboard API failed:', err);
        }
      }
      
      // Fallback for older browsers or non-secure contexts
      return this.fallbackCopy(text);
    },

    fallbackCopy: function(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    },

    copyGist: async function(gist) {
      const success = await this.copy(gist.code);
      if (success) {
        this.showCopyFeedback('Code copied to clipboard!');
      } else {
        this.showCopyFeedback('Copy failed. Try selecting manually.', 'error');
      }
      return success;
    },

    showCopyFeedback: function(message, type = 'success') {
      const feedback = document.createElement('div');
      feedback.className = `copy-feedback ${type}`;
      feedback.textContent = message;
      feedback.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#98c379' : '#e06c75'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      `;
      
      document.body.appendChild(feedback);
      
      setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(feedback), 300);
      }, 3000);
    }
  };

  // Advanced Share functionality
  const ShareManager = {
    canShare: function() {
      return navigator.share !== undefined;
    },

    generateShareCard: function(gist) {
      // Create a stylish card for sharing
      const card = document.createElement('div');
      card.className = 'share-card';
      card.innerHTML = `
        <div class="share-card-content">
          <div class="share-header">
            <h3>${gist.title}</h3>
            <span class="share-lang">${gist.language}</span>
          </div>
          <p class="share-description">${gist.description}</p>
          <div class="share-meta">
            <span>📥 ${gist.downloads} downloads</span>
            <span>👁️ ${gist.views} views</span>
            <span>📅 ${new Date(gist.dateModified).toLocaleDateString()}</span>
          </div>
          <div class="share-code-preview">
            <pre><code>${gist.code.substring(0, 200)}...</code></pre>
          </div>
          <div class="share-tags">
            ${gist.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
        </div>
      `;
      return card;
    },

    shareGist: async function(gist) {
      const shareData = {
        title: `${gist.title} - Gist Library`,
        text: `Check out this ${gist.language} snippet: ${gist.description}\n\n${gist.code.substring(0, 500)}...`,
        url: window.location.href + `?gist=${gist.id}`
      };

      if (this.canShare()) {
        try {
          await navigator.share(shareData);
          return true;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
            return this.fallbackShare(gist);
          }
        }
      } else {
        return this.fallbackShare(gist);
      }
    },

    fallbackShare: function(gist) {
      // Enhanced fallback for Android and other platforms
      const shareModal = this.createShareModal(gist);
      document.body.appendChild(shareModal);
      
      // Add share options
      this.addShareOptions(shareModal, gist);
      
      return true;
    },

    createShareModal: function(gist) {
      const modal = document.createElement('div');
      modal.className = 'share-modal';
      modal.innerHTML = `
        <div class="share-modal-overlay"></div>
        <div class="share-modal-content">
          <div class="share-modal-header">
            <h3>Share Gist</h3>
            <button class="close-modal">✕</button>
          </div>
          <div class="share-preview">
            ${this.generateShareCard(gist).innerHTML}
          </div>
          <div class="share-options">
            <h4>Share via:</h4>
            <div class="share-buttons"></div>
          </div>
          <div class="share-link">
            <input type="text" value="${window.location.href}?gist=${gist.id}" readonly>
            <button class="copy-link">Copy Link</button>
          </div>
        </div>
      `;

      // Event listeners
      modal.querySelector('.close-modal').onclick = () => {
        modal.remove();
      };

      modal.querySelector('.share-modal-overlay').onclick = () => {
        modal.remove();
      };

      modal.querySelector('.copy-link').onclick = async () => {
        const input = modal.querySelector('.share-link input');
        input.select();
        await ClipboardManager.copy(input.value);
      };

      return modal;
    }
  };
  
addShareOptions: function(modal, gist) {
      const container = modal.querySelector('.share-buttons');
      const shareUrl = encodeURIComponent(`${window.location.href}?gist=${gist.id}`);
      const shareText = encodeURIComponent(`${gist.title} - ${gist.description}`);
      
      const shareOptions = [
        {
          name: 'WhatsApp',
          icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`,
          url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
          color: '#25D366'
        },
        {
          name: 'Telegram',
          icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
          url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
          color: '#0088cc'
        },
        {
          name: 'Twitter',
          icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
          url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
          color: '#000000'
        },
        {
          name: 'LinkedIn',
          icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
          color: '#0077B5'
        },
        {
          name: 'Email',
          icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
          url: `mailto:?subject=${shareText}&body=${shareText}%0A%0A${shareUrl}`,
          color: '#666666'
        },
        {
          name: 'Copy',
          icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
          action: 'copy',
          color: '#9aa4b2'
        }
      ];

      shareOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'share-option-btn';
        button.innerHTML = `
          <span class="share-icon" style="color: ${option.color}">${option.icon}</span>
          <span class="share-label">${option.name}</span>
        `;

        if (option.action === 'copy') {
          button.onclick = async () => {
            const fullText = `${gist.title}\n${gist.description}\n\n${gist.code}\n\nView at: ${window.location.href}?gist=${gist.id}`;
            await ClipboardManager.copy(fullText);
          };
        } else {
          button.onclick = () => {
            window.open(option.url, '_blank', 'width=600,height=400');
          };
        }

        container.appendChild(button);
      });
    }
  });

  // Favorites Management
  const FavoritesManager = {
    toggle: function(gist) {
      const isFav = Storage.isFavorite(gist.id);
      
      if (isFav) {
        Storage.removeFromArray(Storage.KEYS.FAVORITES, gist.id);
        this.updateUI(gist.id, false);
        this.showFeedback('Removed from favorites', 'remove');
      } else {
        const favItem = {
          id: gist.id,
          title: gist.title,
          language: gist.language,
          dateAdded: new Date().toISOString()
        };
        Storage.addToArray(Storage.KEYS.FAVORITES, favItem);
        this.updateUI(gist.id, true);
        this.showFeedback('Added to favorites', 'add');
      }
    },

    updateUI: function(gistId, isFavorite) {
      const card = document.querySelector(`[data-id="${gistId}"]`);
      if (card) {
        const favBtn = card.querySelector('#favorite');
        if (favBtn) {
          favBtn.classList.toggle('active', isFavorite);
          const icon = favBtn.querySelector('svg');
          if (icon) {
            icon.style.fill = isFavorite ? '#ff7b72' : 'none';
            icon.style.stroke = isFavorite ? '#ff7b72' : '#9aa4b2';
          }
        }
      }
    },

    showFeedback: function(message, type) {
      const toast = document.createElement('div');
      toast.className = `favorite-toast ${type}`;
      toast.innerHTML = `
        <span class="toast-icon">${type === 'add' ? '⭐' : '✖️'}</span>
        <span class="toast-message">${message}</span>
      `;
      
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: ${type === 'add' ? '#98c379' : '#e06c75'};
        color: white;
        border-radius: 25px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: toastSlideIn 0.3s ease-out;
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    },

    loadFavorites: function() {
      const favorites = Storage.get(Storage.KEYS.FAVORITES);
      favorites.forEach(fav => {
        this.updateUI(fav.id, true);
      });
    }
  };

  // UI Builder and Renderer
  const UIBuilder = {
    createGistCard: function(gist) {
      const card = document.createElement('div');
      card.className = 'card gist';
      card.setAttribute('data-lang', gist.language);
      card.setAttribute('data-cat', gist.category);
      card.setAttribute('data-id', gist.id);

      const isFavorite = Storage.isFavorite(gist.id);

      card.innerHTML = `
        <div class="toolBar">
          <div class="option" id="copy" title="Copy code">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa4b2" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </div>
          <div class="option" id="share" title="Share gist">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa4b2" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </div>
          <div class="option" id="download" title="Download file">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa4b2" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <div class="option ${isFavorite ? 'active' : ''}" id="favorite" title="Add to favorites">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? '#ff7b72' : 'none'}" stroke="${isFavorite ? '#ff7b72' : '#9aa4b2'}" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
        </div>
        
        <textarea class="description" rows="3" readonly>${gist.title}\n${gist.description}</textarea>
        
        <pre><code class="language-${gist.language}">${CodeHighlighter.highlight(gist.code, gist.language)}</code></pre>
        
        <div class="card-footer">
          <div class="tags">
            ${gist.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
          <div class="stats">
            <span>📥 ${gist.downloads}</span>
            <span>👁️ ${gist.views}</span>
          </div>
        </div>
      `;

      // Attach event listeners
      this.attachCardEvents(card, gist);

      return card;
    },

    attachCardEvents: function(card, gist) {
      // Copy button
      card.querySelector('#copy').addEventListener('click', () => {
        ClipboardManager.copyGist(gist);
      });

      // Share button
      card.querySelector('#share').addEventListener('click', () => {
        ShareManager.shareGist(gist);
      });

      // Download button
      card.querySelector('#download').addEventListener('click', () => {
        FileManager.download(gist);
      });

      // Favorite button
      card.querySelector('#favorite').addEventListener('click', () => {
        FavoritesManager.toggle(gist);
      });

      // Track view
      this.trackView(gist);
    },

    trackView: function(gist) {
      // Increment view count
      const category = gistDatabase[gist.language];
      const gistIndex = category.findIndex(g => g.id === gist.id);
      if (gistIndex !== -1) {
        category[gistIndex].views++;
      }

      // Add to recent views
      const recentView = {
        id: gist.id,
        title: gist.title,
        language: gist.language,
        viewedAt: new Date().toISOString()
      };
      
      const recentViews = Storage.get(Storage.KEYS.RECENT_VIEWS);
      const existingIndex = recentViews.findIndex(v => v.id === gist.id);
      
      if (existingIndex !== -1) {
        recentViews.splice(existingIndex, 1);
      }
      
      recentViews.unshift(recentView);
      
      if (recentViews.length > 20) {
        recentViews.pop();
      }
      
      Storage.set(Storage.KEYS.RECENT_VIEWS, recentViews);
    }
  };  


  const SearchEngine = {
    index: null,
    
    buildIndex: function() {
      this.index = [];
      
      Object.entries(gistDatabase).forEach(([language, gists]) => {
        gists.forEach(gist => {
          this.index.push({
            ...gist,
            searchableText: `${gist.title} ${gist.description} ${gist.tags.join(' ')} ${gist.code}`.toLowerCase()
          });
        });
      });
    },

    search: function(query, filters = {}) {
      if (!this.index) this.buildIndex();
      
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
      let results = this.index;

      // Text search
      if (searchTerms.length > 0) {
        results = results.filter(gist => 
          searchTerms.every(term => gist.searchableText.includes(term))
        );
      }

      // Apply filters
      if (filters.language) {
        results = results.filter(gist => gist.language === filters.language);
      }

      if (filters.category) {
        results = results.filter(gist => gist.category === filters.category);
      }

      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(gist => 
          filters.tags.some(tag => gist.tags.includes(tag))
        );
      }

      // Sort results
      if (filters.sortBy) {
        results = this.sortResults(results, filters.sortBy);
      }

      return results;
    },

    sortResults: function(results, sortBy) {
      const sortFunctions = {
        relevance: (a, b) => b.views + b.downloads - (a.views + a.downloads),
        newest: (a, b) => new Date(b.dateModified) - new Date(a.dateModified),
        oldest: (a, b) => new Date(a.dateModified) - new Date(b.dateModified),
        popular: (a, b) => b.views - a.views,
        downloads: (a, b) => b.downloads - a.downloads,
        alphabetical: (a, b) => a.title.localeCompare(b.title)
      };

      return results.sort(sortFunctions[sortBy] || sortFunctions.relevance);
    },

    getSuggestions: function(query) {
      if (!this.index) this.buildIndex();
      
      const suggestions = new Set();
      const lowerQuery = query.toLowerCase();

      this.index.forEach(gist => {
        // Title suggestions
        if (gist.title.toLowerCase().includes(lowerQuery)) {
          suggestions.add(gist.title);
        }

        // Tag suggestions
        gist.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lowerQuery)) {
            suggestions.add(tag);
          }
        });
      });

      return Array.from(suggestions).slice(0, 10);
    }
  };

  // Category Management
  const CategoryManager = {
    categories: {
      debug: { name: 'Debugging', icon: '🐛', color: '#e06c75' },
      utility: { name: 'Utilities', icon: '🔧', color: '#61afef' },
      animation: { name: 'Animations', icon: '✨', color: '#c792ea' },
      api: { name: 'API Integration', icon: '🔌', color: '#98c379' },
      dom: { name: 'DOM Manipulation', icon: '📄', color: '#e5c07b' },
      validation: { name: 'Validation', icon: '✅', color: '#56b6c2' },
      data: { name: 'Data Processing', icon: '📊', color: '#ff7b72' },
      ui: { name: 'UI Components', icon: '🎨', color: '#79c0ff' }
    },

    getCategories: function() {
      const categoryCounts = {};
      
      Object.values(gistDatabase).forEach(gists => {
        gists.forEach(gist => {
          categoryCounts[gist.category] = (categoryCounts[gist.category] || 0) + 1;
        });
      });

      return Object.entries(this.categories).map(([key, value]) => ({
        key,
        ...value,
        count: categoryCounts[key] || 0
      }));
    },

    getCategoryInfo: function(categoryKey) {
      return this.categories[categoryKey] || { name: categoryKey, icon: '📁', color: '#9aa4b2' };
    }
  };

  // Animation System
  const AnimationManager = {
    init: function() {
      // Add CSS animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes toastSlideIn {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes toastSlideOut {
          from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .card {
          animation: fadeIn 0.3s ease-out;
        }

        .option {
          transition: all 0.2s ease;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
        }

        .option:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        .option:active {
          transform: scale(0.95);
        }

        .option.active {
          animation: pulse 0.3s ease;
        }

        .share-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .share-modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          animation: fadeIn 0.2s ease;
        }

        .share-modal-content {
          position: relative;
          background: var(--bg-code);
          border: 1.5px solid var(--bd-code);
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .share-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          color: var(--fg-code);
        }

        .close-modal {
          background: none;
          border: none;
          color: var(--fg-muted);
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-modal:hover {
          color: var(--fg-code);
          transform: rotate(90deg);
        }

        .share-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .share-option-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--fg-muted);
        }

        .share-option-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .share-icon svg {
          width: 24px;
          height: 24px;
        }

        .share-label {
          font-size: 12px;
        }

        .share-link {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .share-link input {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: var(--fg-code);
          font-family: monospace;
          font-size: 12px;
        }

        .copy-link {
          padding: 10px 20px;
          background: var(--tok-function);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .copy-link:hover {
          background: var(--tok-keyword);
          transform: translateY(-1px);
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--bd-code);
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 11px;
          color: var(--tok-string);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stats {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--fg-muted);
        }

        .share-card-content {
          background: var(--bg-body);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .share-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .share-header h3 {
          margin: 0;
          color: var(--fg-code);
        }

        .share-lang {
          padding: 4px 12px;
          background: var(--tok-keyword);
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .share-description {
          color: var(--fg-muted);
          margin-bottom: 16px;
        }

        .share-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--fg-muted);
        }

        .share-code-preview {
          background: var(--bg-code);
          border: 1px solid var(--bd-code);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 16px;
          font-size: 11px;
          overflow: hidden;
        }

        .share-code-preview pre {
          margin: 0;
          padding: 0;
          max-height: 120px;
        }

        .share-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
      `;
      document.head.appendChild(style);
    },

    animateCard: function(card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        card.style.transition = 'all 0.3s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
  };

  // URL Parameter Handler
  const URLHandler = {
    init: function() {
      const params = new URLSearchParams(window.location.search);
      const gistId = params.get('gist');
      
      if (gistId) {
        this.loadSharedGist(gistId);
      }
    },

    loadSharedGist: function(gistId) {
      // Find gist in database
      let foundGist = null;
      
      for (const [language, gists] of Object.entries(gistDatabase)) {
        const gist = gists.find(g => g.id === gistId);
        if (gist) {
          foundGist = gist;
          break;
        }
      }

      if (foundGist) {
        // Scroll to gist or highlight it
        setTimeout(() => {
          const card = document.querySelector(`[data-id="${gistId}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.boxShadow = '0 0 20px rgba(97, 175, 239, 0.5)';
            setTimeout(() => {
              card.style.boxShadow = '';
            }, 3000);
          }
        }, 500);
      }
    },

    updateURL: function(gistId) {
      const url = new URL(window.location);
      url.searchParams.set('gist', gistId);
      window.history.pushState({}, '', url);
    }
  };

  // Main Library API
  const API = {
    gistDatabase: gistDatabase,
    
    init: function(config = {}) {
      // Initialize subsystems
      AnimationManager.init();
      SearchEngine.buildIndex();
      URLHandler.init();
      
      // Load saved preferences
      const preferences = Storage.get(Storage.KEYS.PREFERENCES);
      if (preferences.theme) {
        document.documentElement.setAttribute('data-theme', preferences.theme);
      }

      // Initialize UI
      if (config.container) {
        this.renderGists(config.container);
      }

      // Load favorites
      FavoritesManager.loadFavorites();

      return this;
    },

    renderGists: function(container) {
      const element = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;

      if (!element) {
        console.error('Container not found');
        return;
      }

      // Clear container
      element.innerHTML = '';

      // Render all gists
      Object.values(gistDatabase).forEach(gists => {
        gists.forEach(gist => {
          const card = UIBuilder.createGistCard(gist);
          element.appendChild(card);
          AnimationManager.animateCard(card);
        });
      });
    },

    addGist: function(gist) {
      if (!gist.id) {
        gist.id = Date.now().toString();
      }

      const category = gistDatabase[gist.language] || [];
      category.push(gist);
      gistDatabase[gist.language] = category;

      // Rebuild search index
      SearchEngine.buildIndex();

      // Save to user gists
      Storage.addToArray(Storage.KEYS.USER_GISTS, {
        id: gist.id,
        title: gist.title,
        language: gist.language,
        dateAdded: new Date().toISOString()
      });

      return gist;
    },

    getGist: function(gistId) {
      for (const gists of Object.values(gistDatabase)) {
        const found = gists.find(g => g.id === gistId);
        if (found) return found;
      }
      return null;
    },

    search: function(query, filters) {
      return SearchEngine.search(query, filters);
    },

    getFavorites: function() {
      const favoriteIds = Storage.get(Storage.KEYS.FAVORITES).map(f => f.id);
      const favorites = [];

      Object.values(gistDatabase).forEach(gists => {
        gists.forEach(gist => {
          if (favoriteIds.includes(gist.id)) {
            favorites.push(gist);
          }
        });
      });

      return favorites;
    },

    getRecentViews: function(limit = 10) {
      const recentViews = Storage.get(Storage.KEYS.RECENT_VIEWS).slice(0, limit);
      return recentViews.map(view => this.getGist(view.id)).filter(Boolean);
    },

    exportFavorites: function() {
      const favorites = this.getFavorites();
      const dataStr = JSON.stringify(favorites, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `gist_favorites_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    },

    // Public access to managers
    Storage,
    FileManager,
    ClipboardManager,
    ShareManager,
    FavoritesManager,
    SearchEngine,
    CategoryManager,
    UIBuilder,
    AnimationManager
  };

  return API;
})();

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.GistLibrary.init({ container: '#gist-container' });
});

// Export for use
window.GistLibrary = GistLibrary;

  
