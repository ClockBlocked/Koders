// ============================================================================
// MYTUNESAPP ENHANCED DIAGNOSTIC SCRIPT v2.0
// ============================================================================
// Comprehensive diagnostic tool with precise error location and detailed analysis
// Author: Enhanced by Assistant | Date: 2025-09-07 | User: ClockBlocked
// ============================================================================

(function() {
    'use strict';
    
    console.clear();
    console.log('%c🔧 MYTUNESAPP ENHANCED DIAGNOSTICS v2.0 STARTING...', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('%c' + '='.repeat(80), 'color: #2196F3;');
    
    const diagnostics = {
        startTime: performance.now(),
        results: {
            critical: [],
            warnings: [],
            missing: [],
            placeholders: [],
            suggestions: [],
            passed: [],
            performance: [],
            security: [],
            accessibility: []
        },
        
        // Enhanced logging with stack traces and context
        log: function(type, message, details = null, location = null) {
            const entry = {
                message,
                details,
                location: location || this.getCallerLocation(),
                timestamp: new Date().toISOString(),
                stack: new Error().stack
            };
            this.results[type].push(entry);
        },
        
        getCallerLocation: function() {
            const stack = new Error().stack;
            const lines = stack.split('\n');
            // Try to find the calling location in the stack
            for (let i = 2; i < lines.length; i++) {
                if (lines[i].includes('diagnosticReport') || lines[i].includes('eval')) {
                    const match = lines[i].match(/at.*?(\d+):(\d+)/);
                    if (match) {
                        return `Line ${match[1]}, Column ${match[2]}`;
                    }
                }
            }
            return 'Unknown location';
        },
        
        // Enhanced element checking with detailed analysis
        checkElement: function(id, description, required = true) {
            const element = document.getElementById(id);
            const location = `DOM Element Check: #${id}`;
            
            if (!element) {
                this.log(required ? 'critical' : 'warnings', 
                    `Missing DOM element: #${id}`, 
                    { 
                        description, 
                        expected: `Element with id="${id}"`,
                        suggestions: [
                            `Add <element id="${id}"> to your HTML`,
                            `Check for typos in element ID`,
                            `Ensure element is not removed by JavaScript`
                        ]
                    }, 
                    location
                );
                return false;
            }
            
            // Detailed element analysis
            const elementInfo = {
                tagName: element.tagName.toLowerCase(),
                classes: Array.from(element.classList),
                attributes: {},
                computedStyle: {},
                children: element.children.length,
                hasContent: element.textContent.trim().length > 0 || element.children.length > 0,
                isVisible: this.isElementVisible(element),
                bounds: element.getBoundingClientRect()
            };
            
            // Get all attributes
            for (let attr of element.attributes) {
                elementInfo.attributes[attr.name] = attr.value;
            }
            
            // Get computed styles for critical properties
            const style = window.getComputedStyle(element);
            ['display', 'visibility', 'opacity', 'position', 'z-index', 'pointer-events'].forEach(prop => {
                elementInfo.computedStyle[prop] = style.getPropertyValue(prop);
            });
            
            // Check for common issues
            if (!elementInfo.isVisible) {
                this.log('warnings', `Element #${id} is not visible`, {
                    description,
                    style: elementInfo.computedStyle,
                    suggestions: ['Check CSS display/visibility properties', 'Verify element positioning']
                }, location);
            }
            
            if (elementInfo.bounds.width === 0 && elementInfo.bounds.height === 0) {
                this.log('warnings', `Element #${id} has zero dimensions`, {
                    description,
                    bounds: elementInfo.bounds,
                    suggestions: ['Check CSS width/height', 'Verify content exists']
                }, location);
            }
            
            this.log('passed', `DOM element found and analyzed: #${id}`, {
                description,
                analysis: elementInfo
            }, location);
            
            return element;
        },
        
        // Enhanced function checking with signature analysis
        checkFunction: function(obj, path, description, expectedParams = null) {
            const func = this.getNestedProperty(obj, path);
            const location = `Function Check: ${path}`;
            
            if (typeof func !== 'function') {
                this.log('missing', `Missing function: ${path}`, {
                    description,
                    actualType: typeof func,
                    actualValue: func,
                    objectStructure: this.analyzeObject(obj),
                    suggestions: [
                        `Define function at ${path}`,
                        `Check function spelling and case sensitivity`,
                        `Ensure parent object exists before adding function`
                    ]
                }, location);
                return false;
            }
            
            // Analyze function signature and body
            const funcString = func.toString();
            const funcAnalysis = {
                name: func.name || 'anonymous',
                length: func.length, // parameter count
                isAsync: funcString.includes('async '),
                isArrow: funcString.includes('=>'),
                bodyLength: funcString.length,
                parameters: this.extractFunctionParameters(funcString),
                hasDocumentation: funcString.includes('/**') || funcString.includes('//'),
                complexity: this.calculateComplexity(funcString)
            };
            
            // Check if function matches expected parameters
            if (expectedParams && funcAnalysis.length !== expectedParams.length) {
                this.log('warnings', `Function ${path} parameter count mismatch`, {
                    expected: expectedParams.length,
                    actual: funcAnalysis.length,
                    expectedParams,
                    actualParams: funcAnalysis.parameters
                }, location);
            }
            
            // Check for placeholder patterns
            if (this.checkPlaceholder(func, path)) {
                // Already logged by checkPlaceholder
            } else {
                this.log('passed', `Function exists and analyzed: ${path}`, {
                    description,
                    analysis: funcAnalysis
                }, location);
            }
            
            return func;
        },
        
        // Enhanced property checking with type validation
        checkProperty: function(obj, path, description, expectedType = null, expectedValue = null) {
            const prop = this.getNestedProperty(obj, path);
            const location = `Property Check: ${path}`;
            
            if (prop === undefined || prop === null) {
                this.log('missing', `Missing property: ${path}`, {
                    description,
                    expected: expectedType || 'any',
                    parentObject: this.analyzeObject(obj),
                    suggestions: [
                        `Initialize ${path} with appropriate value`,
                        `Check property name spelling`,
                        `Ensure parent object is properly structured`
                    ]
                }, location);
                return false;
            }
            
            const actualType = this.getDetailedType(prop);
            const propertyAnalysis = {
                type: actualType,
                value: this.safeStringify(prop),
                isFunction: typeof prop === 'function',
                isArray: Array.isArray(prop),
                isObject: typeof prop === 'object' && prop !== null,
                length: prop.length,
                keys: typeof prop === 'object' && prop !== null ? Object.keys(prop) : null
            };
            
            // Type checking
            if (expectedType && !this.typeMatches(prop, expectedType)) {
                this.log('warnings', `Property type mismatch: ${path}`, {
                    description,
                    expected: expectedType,
                    actual: actualType,
                    analysis: propertyAnalysis,
                    suggestions: [`Convert ${path} to ${expectedType} type`]
                }, location);
            }
            
            // Value checking
            if (expectedValue !== null && prop !== expectedValue) {
                this.log('warnings', `Property value mismatch: ${path}`, {
                    description,
                    expected: expectedValue,
                    actual: prop,
                    suggestions: [`Set ${path} to expected value: ${expectedValue}`]
                }, location);
            }
            
            this.log('passed', `Property exists and analyzed: ${path}`, {
                description,
                analysis: propertyAnalysis
            }, location);
            
            return prop;
        },
        
        // Enhanced nested property getter with path validation
        getNestedProperty: function(obj, path) {
            if (!obj || typeof path !== 'string') return undefined;
            
            const keys = path.split('.');
            let current = obj;
            
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (current === null || current === undefined) {
                    return undefined;
                }
                
                if (!(key in current)) {
                    return undefined;
                }
                
                current = current[key];
            }
            
            return current;
        },
        
        // Enhanced placeholder detection with specific patterns
        checkPlaceholder: function(func, funcName, keywords = ['coming soon', 'todo', 'placeholder', 'not implemented', 'fix me', 'hack']) {
            if (typeof func !== 'function') return false;
            
            const funcString = func.toString().toLowerCase();
            const foundKeywords = keywords.filter(keyword => funcString.includes(keyword));
            const hasEmptyBody = funcString.match(/\{[\s]*\}/) !== null;
            const hasOnlyReturn = funcString.match(/\{[\s]*return[\s;]*\}/) !== null;
            const hasConsoleLog = funcString.includes('console.log') && funcString.length < 200;
            const throwsNotImplemented = funcString.includes('throw') && funcString.includes('not implemented');
            
            const isPlaceholder = foundKeywords.length > 0 || hasEmptyBody || hasOnlyReturn || throwsNotImplemented;
            
            if (isPlaceholder) {
                this.log('placeholders', `Placeholder function detected: ${funcName}`, {
                    keywords: foundKeywords,
                    patterns: {
                        hasEmptyBody,
                        hasOnlyReturn,
                        hasConsoleLog,
                        throwsNotImplemented
                    },
                    function: funcString.substring(0, 300) + (funcString.length > 300 ? '...' : ''),
                    suggestions: [
                        'Implement actual functionality',
                        'Add proper error handling',
                        'Write unit tests for implementation'
                    ]
                }, `Placeholder Check: ${funcName}`);
                return true;
            }
            
            return false;
        },
        
        // Utility functions for enhanced analysis
        isElementVisible: function(element) {
            const style = window.getComputedStyle(element);
            const bounds = element.getBoundingClientRect();
            
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   style.opacity !== '0' &&
                   bounds.width > 0 && 
                   bounds.height > 0;
        },
        
        getDetailedType: function(value) {
            if (value === null) return 'null';
            if (Array.isArray(value)) return `array[${value.length}]`;
            if (value instanceof Audio) return 'Audio';
            if (value instanceof HTMLElement) return `HTMLElement(${value.tagName})`;
            if (typeof value === 'object') {
                const constructor = value.constructor?.name;
                return constructor ? `${constructor}` : 'object';
            }
            return typeof value;
        },
        
        typeMatches: function(value, expectedType) {
            const actualType = this.getDetailedType(value);
            if (expectedType === 'array') return Array.isArray(value);
            if (expectedType === 'object') return typeof value === 'object' && value !== null;
            return actualType.includes(expectedType) || typeof value === expectedType;
        },
        
        safeStringify: function(obj, maxLength = 100) {
            try {
                const str = JSON.stringify(obj, null, 2);
                return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
            } catch (e) {
                return `[Circular or Complex Object: ${typeof obj}]`;
            }
        },
        
        analyzeObject: function(obj) {
            if (!obj || typeof obj !== 'object') return obj;
            
            return {
                type: this.getDetailedType(obj),
                keys: Object.keys(obj),
                values: Object.keys(obj).reduce((acc, key) => {
                    acc[key] = this.getDetailedType(obj[key]);
                    return acc;
                }, {}),
                prototype: obj.constructor?.name
            };
        },
        
        extractFunctionParameters: function(funcString) {
            const match = funcString.match(/\(([^)]*)\)/);
            if (!match || !match[1]) return [];
            
            return match[1].split(',').map(param => param.trim()).filter(param => param.length > 0);
        },
        
        calculateComplexity: function(funcString) {
            // Simple cyclomatic complexity calculation
            const patterns = [
                /if\s*\(/g, /else/g, /for\s*\(/g, /while\s*\(/g, 
                /catch\s*\(/g, /case\s+/g, /\&\&/g, /\|\|/g, /\?/g
            ];
            
            let complexity = 1; // Base complexity
            patterns.forEach(pattern => {
                const matches = funcString.match(pattern);
                if (matches) complexity += matches.length;
            });
            
            return complexity;
        },
        
        // Network and resource analysis
        analyzeNetworkResources: function() {
            const resources = performance.getEntriesByType('resource');
            const analysis = {
                total: resources.length,
                failed: 0,
                slow: 0,
                images: 0,
                scripts: 0,
                stylesheets: 0,
                audio: 0,
                other: 0
            };
            
            resources.forEach(resource => {
                if (resource.responseEnd === 0) analysis.failed++;
                if (resource.duration > 1000) analysis.slow++;
                
                if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) analysis.images++;
                else if (resource.name.match(/\.js$/i)) analysis.scripts++;
                else if (resource.name.match(/\.css$/i)) analysis.stylesheets++;
                else if (resource.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)) analysis.audio++;
                else analysis.other++;
            });
            
            return analysis;
        },
        
        // Memory usage analysis
        analyzeMemoryUsage: function() {
            if (!performance.memory) return null;
            
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                usagePercentage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2)
            };
        },
        
        // Event listener analysis
        analyzeEventListeners: function() {
            const elements = document.querySelectorAll('*');
            const analysis = {
                totalElements: elements.length,
                elementsWithListeners: 0,
                totalListeners: 0,
                listenersByType: {},
                heavyElements: []
            };
            
            elements.forEach(el => {
                if (typeof getEventListeners === 'function') {
                    try {
                        const listeners = getEventListeners(el);
                        const listenerCount = Object.values(listeners).reduce((sum, arr) => sum + arr.length, 0);
                        
                        if (listenerCount > 0) {
                            analysis.elementsWithListeners++;
                            analysis.totalListeners += listenerCount;
                            
                            if (listenerCount > 3) {
                                analysis.heavyElements.push({
                                    element: el.tagName + (el.id ? `#${el.id}` : '') + (el.className ? `.${el.className.split(' ')[0]}` : ''),
                                    listenerCount,
                                    types: Object.keys(listeners)
                                });
                            }
                            
                            Object.keys(listeners).forEach(type => {
                                analysis.listenersByType[type] = (analysis.listenersByType[type] || 0) + listeners[type].length;
                            });
                        }
                    } catch (e) {
                        // getEventListeners not available or error
                    }
                }
            });
            
            return analysis;
        }
    };
    
    // ============================================================================
    // ENHANCED CORE DEPENDENCIES CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 1: Core Dependencies Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // Music library deep analysis
    if (!window.music) {
        diagnostics.log('critical', 'Music library not loaded', {
            location: 'window.music',
            expectedStructure: 'Array of artist objects',
            actualValue: window.music,
            debugging: {
                globalVariables: Object.keys(window).filter(key => key.toLowerCase().includes('music')),
                suggestions: [
                    'Check if music.js is loaded',
                    'Verify script loading order',
                    'Check for JavaScript errors preventing music data loading',
                    'Ensure fetch/AJAX requests for music data are successful'
                ]
            }
        });
    } else if (!Array.isArray(window.music)) {
        diagnostics.log('critical', 'Music library is not an array', {
            actualType: diagnostics.getDetailedType(window.music),
            actualValue: diagnostics.safeStringify(window.music),
            expected: 'Array',
            fix: 'Ensure window.music is initialized as an array: window.music = []'
        });
    } else if (window.music.length === 0) {
        diagnostics.log('warnings', 'Music library is empty', {
            actualLength: 0,
            suggestions: [
                'Load sample music data for testing',
                'Check music data source (JSON file, API, etc.)',
                'Verify data loading process completes successfully'
            ]
        });
    } else {
        diagnostics.log('passed', `Music library loaded successfully`, {
            artistCount: window.music.length,
            totalAlbums: window.music.reduce((sum, artist) => sum + (artist.albums?.length || 0), 0),
            totalSongs: window.music.reduce((sum, artist) => 
                sum + (artist.albums?.reduce((albumSum, album) => 
                    albumSum + (album.songs?.length || 0), 0) || 0), 0)
        });
        
        // Deep structure validation
        window.music.forEach((artist, artistIndex) => {
            const artistPath = `music[${artistIndex}]`;
            
            if (!artist.artist) {
                diagnostics.log('warnings', `Artist missing name property`, {
                    location: `${artistPath}.artist`,
                    artistData: diagnostics.safeStringify(artist),
                    fix: `Add "artist" property to ${artistPath}`
                });
            }
            
            if (!artist.albums || !Array.isArray(artist.albums)) {
                diagnostics.log('warnings', `Artist albums property invalid`, {
                    location: `${artistPath}.albums`,
                    expected: 'Array',
                    actual: diagnostics.getDetailedType(artist.albums),
                    fix: `Initialize ${artistPath}.albums as an array`
                });
            } else {
                artist.albums.forEach((album, albumIndex) => {
                    const albumPath = `${artistPath}.albums[${albumIndex}]`;
                    
                    if (!album.album) {
                        diagnostics.log('warnings', `Album missing name property`, {
                            location: `${albumPath}.album`,
                            albumData: diagnostics.safeStringify(album),
                            fix: `Add "album" property to ${albumPath}`
                        });
                    }
                    
                    if (!album.songs || !Array.isArray(album.songs)) {
                        diagnostics.log('warnings', `Album songs property invalid`, {
                            location: `${albumPath}.songs`,
                            expected: 'Array',
                            actual: diagnostics.getDetailedType(album.songs)
                        });
                    } else {
                        album.songs.forEach((song, songIndex) => {
                            const songPath = `${albumPath}.songs[${songIndex}]`;
                            const requiredProps = ['id', 'title'];
                            const recommendedProps = ['duration', 'file', 'url'];
                            
                            requiredProps.forEach(prop => {
                                if (!song[prop]) {
                                    diagnostics.log('warnings', `Song missing required property: ${prop}`, {
                                        location: `${songPath}.${prop}`,
                                        songData: diagnostics.safeStringify(song),
                                        requiredProperties: requiredProps,
                                        fix: `Add "${prop}" property to song object`
                                    });
                                }
                            });
                            
                            recommendedProps.forEach(prop => {
                                if (!song[prop]) {
                                    diagnostics.log('suggestions', `Song missing recommended property: ${prop}`, {
                                        location: `${songPath}.${prop}`,
                                        benefit: prop === 'duration' ? 'Progress bar functionality' :
                                                prop === 'file' || prop === 'url' ? 'Audio playback' : 'Enhanced functionality'
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    
    // Render module analysis
    if (!window.render) {
        diagnostics.log('critical', 'Render module not loaded', {
            location: 'window.render',
            expectedStructure: 'Object with template functions',
            relatedFiles: ['render.js', 'templates.js'],
            debugging: {
                renderRelated: Object.keys(window).filter(key => key.toLowerCase().includes('render')),
                suggestions: [
                    'Check if render.js is included in HTML',
                    'Verify render module initialization',
                    'Check console for render module loading errors'
                ]
            }
        });
    } else {
        const renderAnalysis = diagnostics.analyzeObject(window.render);
        diagnostics.log('passed', 'Render module loaded', {
            analysis: renderAnalysis,
            functionCount: Object.keys(window.render).filter(key => typeof window.render[key] === 'function').length
        });
    }
    
    // App initialization analysis
    const appInitialized = window.appState || window.MyTunesApp;
    if (!appInitialized) {
        diagnostics.log('critical', 'App not initialized', {
            expectedGlobals: ['window.appState', 'window.MyTunesApp'],
            actualGlobals: {
                appState: typeof window.appState,
                MyTunesApp: typeof window.MyTunesApp,
                musicAppAPI: typeof window.musicAppAPI
            },
            suggestions: [
                'Call MyTunesApp.initialize() or equivalent',
                'Check for initialization errors in console',
                'Verify all dependencies are loaded before initialization'
            ]
        });
    }
    
    // ============================================================================
    // ENHANCED DOM ELEMENTS CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 2: DOM Elements Deep Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    const requiredElements = {
        // Critical UI Elements
        'now-playing-area': { description: 'Main now playing display area', critical: true },
        'theme-toggle': { description: 'Theme toggle button', critical: true },
        'menu-trigger': { description: 'Dropdown menu trigger', critical: true },
        'dropdown-menu': { description: 'Dropdown menu container', critical: true },
        
        // Player Controls
        'play-pause-navbar': { description: 'Navbar play/pause button', critical: true },
        'prev-btn-navbar': { description: 'Navbar previous button', critical: false },
        'next-btn-navbar': { description: 'Navbar next button', critical: false },
        'play-icon-navbar': { description: 'Navbar play icon', critical: true },
        'pause-icon-navbar': { description: 'Navbar pause icon', critical: true },
        
        // Now Playing Info
        'navbar-album-cover': { description: 'Navbar album cover image', critical: true },
        'navbar-artist': { description: 'Navbar artist name', critical: true },
        'navbar-song-title': { description: 'Navbar song title', critical: true },
        
        // Music Player Popup
        'musicPlayer': { description: 'Music player popup container', critical: true },
        'popup-album-cover': { description: 'Popup album cover', critical: false },
        'popup-song-title': { description: 'Popup song title', critical: false },
        'popup-artist-name': { description: 'Popup artist name', critical: false },
        'popup-progress-bar': { description: 'Popup progress bar', critical: false },
        'popup-play-pause-btn': { description: 'Popup play/pause button', critical: false },
        'popup-favorite-btn': { description: 'Popup favorite button', critical: false },
        
        // Content Areas
        'dynamic-content': { description: 'Main dynamic content area', critical: true },
        'queue-list': { description: 'Queue list container', critical: false },
        'recent-list': { description: 'Recently played list container', critical: false }
    };
    
    // Enhanced DOM analysis
    Object.entries(requiredElements).forEach(([id, config]) => {
        const element = diagnostics.checkElement(id, config.description, config.critical);
        
        if (element) {
            // Additional checks for specific elements
            if (id.includes('play') || id.includes('pause')) {
                // Check for click handlers
                const hasClickHandler = element.onclick || 
                                      element.getAttribute('onclick') || 
                                      element.addEventListener;
                if (!hasClickHandler) {
                    diagnostics.log('warnings', `Play/pause element may be missing click handler`, {
                        element: id,
                        suggestions: ['Add click event listener', 'Verify button functionality']
                    });
                }
            }
            
            if (id.includes('cover') || id.includes('image')) {
                // Check image elements
                if (element.tagName.toLowerCase() === 'img') {
                    if (!element.src || element.src.includes('placeholder')) {
                        diagnostics.log('suggestions', `Image element using placeholder`, {
                            element: id,
                            currentSrc: element.src
                        });
                    }
                }
            }
        }
    });
    
    // Check for duplicate IDs
    const allElements = document.querySelectorAll('[id]');
    const idCounts = {};
    allElements.forEach(el => {
        const id = el.id;
        idCounts[id] = (idCounts[id] || 0) + 1;
    });
    
    Object.entries(idCounts).forEach(([id, count]) => {
        if (count > 1) {
            diagnostics.log('critical', `Duplicate ID found: ${id}`, {
                occurrences: count,
                impact: 'JavaScript and CSS selectors may not work correctly',
                fix: 'Ensure all IDs are unique across the document'
            });
        }
    });
    
    // ============================================================================
    // ENHANCED JAVASCRIPT API CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 3: JavaScript API Deep Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // App State Analysis
    const appState = window.appState;
    if (appState) {
        console.log('Analyzing app state structure...');
        
        const expectedStateStructure = {
            'audio': { type: 'Audio', description: 'HTML5 Audio element' },
            'currentSong': { type: 'object', description: 'Current song data object' },
            'isPlaying': { type: 'boolean', description: 'Current playback state' },
            'volume': { type: 'number', description: 'Current volume level (0-1)' },
            'currentTime': { type: 'number', description: 'Current playback time' },
            'duration': { type: 'number', description: 'Current song duration' },
            'queue': { type: 'object', description: 'Queue management object' },
            'favorites': { type: 'object', description: 'Favorites management object' }
        };
        
        Object.entries(expectedStateStructure).forEach(([prop, config]) => {
            diagnostics.checkProperty(appState, prop, config.description, config.type);
        });
        
        // Queue analysis
        if (appState.queue) {
            const expectedQueueMethods = [
                { name: 'add', params: ['song'], description: 'Add song to queue' },
                { name: 'remove', params: ['index'], description: 'Remove song from queue' },
                { name: 'clear', params: [], description: 'Clear entire queue' },
                { name: 'getNext', params: [], description: 'Get next song in queue' },
                { name: 'playAt', params: ['index'], description: 'Play song at specific index' }
            ];
            
            expectedQueueMethods.forEach(method => {
                diagnostics.checkFunction(appState.queue, method.name, method.description, method.params);
            });
            
            // Check queue data structure
            if (appState.queue.items && Array.isArray(appState.queue.items)) {
                diagnostics.log('passed', 'Queue items array found', {
                    itemCount: appState.queue.items.length,
                    structure: 'array'
                });
            }
        }
        
        // Favorites analysis
        if (appState.favorites) {
            const expectedFavoritesMethods = [
                { name: 'add', params: ['song'], description: 'Add song to favorites' },
                { name: 'remove', params: ['songId'], description: 'Remove song from favorites' },
                { name: 'toggle', params: ['song'], description: 'Toggle favorite status' },
                { name: 'has', params: ['songId'], description: 'Check if song is favorited' }
            ];
            
            expectedFavoritesMethods.forEach(method => {
                diagnostics.checkFunction(appState.favorites, method.name, method.description, method.params);
            });
        }
    }
    
    // Music App API Analysis
    const musicAPI = window.musicAppAPI;
    if (musicAPI) {
        console.log('Analyzing music app API...');
        
        // Player API
        if (musicAPI.player) {
            const expectedPlayerMethods = [
                { name: 'playSong', params: ['songData'], description: 'Play a specific song' },
                { name: 'play', params: [], description: 'Resume playback' },
                { name: 'pause', params: [], description: 'Pause playback' },
                { name: 'toggle', params: [], description: 'Toggle play/pause' },
                { name: 'next', params: [], description: 'Play next song' },
                { name: 'previous', params: [], description: 'Play previous song' },
                { name: 'seekTo', params: ['time'], description: 'Seek to specific time' },
                { name: 'setVolume', params: ['volume'], description: 'Set volume level' }
            ];
            
            expectedPlayerMethods.forEach(method => {
                diagnostics.checkFunction(musicAPI.player, method.name, method.description, method.params);
            });
        }
        
        // UI API
        if (musicAPI.ui) {
            const expectedUIMethods = [
                { name: 'updateNowPlaying', params: ['songData'], description: 'Update now playing display' },
                { name: 'updateNavbar', params: ['songData'], description: 'Update navbar with current song' },
                { name: 'updatePlayPauseButtons', params: ['isPlaying'], description: 'Update play/pause button states' },
                { name: 'showNotification', params: ['message', 'type'], description: 'Show user notification' }
            ];
            
            expectedUIMethods.forEach(method => {
                diagnostics.checkFunction(musicAPI.ui, method.name, method.description, method.params);
            });
        }
        
        // Theme API
        if (musicAPI.theme) {
            diagnostics.checkFunction(musicAPI.theme, 'toggle', 'Theme toggle functionality');
            diagnostics.checkFunction(musicAPI.theme, 'set', 'Set specific theme');
            diagnostics.checkProperty(musicAPI.theme, 'current', 'Current theme name', 'string');
        }
    } else {
        diagnostics.log('critical', 'Music App API not available', {
            location: 'window.musicAppAPI',
            expectedStructure: 'Object with player, ui, theme, and other API modules',
            suggestions: [
                'Initialize musicAppAPI object',
                'Check API module loading',
                'Verify module exports and imports'
            ]
        });
    }
    
    // ============================================================================
    // ENHANCED AUDIO FUNCTIONALITY CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 4: Audio System Deep Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    if (appState?.audio) {
        const audio = appState.audio;
        
        if (!(audio instanceof Audio)) {
            diagnostics.log('critical', 'Audio element is not an Audio instance', {
                actualType: diagnostics.getDetailedType(audio),
                expected: 'HTML5 Audio element',
                fix: 'Initialize with: new Audio()'
            });
        } else {
            diagnostics.log('passed', 'Audio element is properly configured');
            
            // Detailed audio analysis
            const audioAnalysis = {
                src: audio.src,
                currentTime: audio.currentTime,
                duration: audio.duration || 'Not loaded',
                volume: audio.volume,
                muted: audio.muted,
                paused: audio.paused,
                ended: audio.ended,
                readyState: audio.readyState,
                networkState: audio.networkState,
                error: audio.error
            };
            
            // Check audio ready state
            const readyStates = {
                0: 'HAVE_NOTHING',
                1: 'HAVE_METADATA',
                2: 'HAVE_CURRENT_DATA',
                3: 'HAVE_FUTURE_DATA',
                4: 'HAVE_ENOUGH_DATA'
            };
            
            diagnostics.log('passed', 'Audio element state analyzed', {
                readyState: `${audio.readyState} (${readyStates[audio.readyState]})`,
                analysis: audioAnalysis
            });
            
            // Check for common audio issues
            if (audio.error) {
                diagnostics.log('critical', 'Audio element has error', {
                    error: {
                        code: audio.error.code,
                        message: audio.error.message
                    },
                    suggestions: [
                        'Check audio file URLs',
                        'Verify audio file formats are supported',
                        'Check CORS headers for audio files',
                        'Ensure audio files are accessible'
                    ]
                });
            }
            
            if (audio.volume === 0 && !audio.muted) {
                diagnostics.log('warnings', 'Audio volume is set to 0', {
                    volume: audio.volume,
                    muted: audio.muted,
                    suggestion: 'Check if this is intentional or should be set to default volume'
                });
            }
            
            // Check event listeners on audio element
            const audioEvents = [
                'loadstart', 'durationchange', 'loadedmetadata', 'loadeddata',
                'progress', 'canplay', 'canplaythrough', 'play', 'pause',
                'timeupdate', 'ended', 'error', 'volumechange'
            ];
            
            // Note: We can't directly check event listeners, but we can test if they respond
            diagnostics.log('suggestions', 'Audio event listeners should be verified', {
                expectedEvents: audioEvents,
                testing: 'Manually test audio events to ensure proper functionality'
            });
        }
    } else {
        diagnostics.log('critical', 'No audio element found in app state', {
            location: 'appState.audio',
            expected: 'HTML5 Audio element instance',
            suggestions: [
                'Initialize audio element: appState.audio = new Audio()',
                'Check audio module loading',
                'Verify app state initialization'
            ]
        });
    }
    
    // Media Session API analysis
    if ('mediaSession' in navigator) {
        diagnostics.log('passed', 'MediaSession API supported');
        
        const mediaSession = navigator.mediaSession;
        
        // Check metadata
        if (mediaSession.metadata) {
            const metadata = mediaSession.metadata;
            diagnostics.log('passed', 'MediaSession metadata is set', {
                title: metadata.title,
                artist: metadata.artist,
                album: metadata.album,
                artwork: metadata.artwork?.length || 0
            });
        } else {
            diagnostics.log('warnings', 'MediaSession metadata not set', {
                suggestion: 'Set metadata for better system integration'
            });
        }
        
        // Test action handlers
        const testActions = ['play', 'pause', 'previoustrack', 'nexttrack', 'seekbackward', 'seekforward'];
        testActions.forEach(action => {
            try {
                navigator.mediaSession.setActionHandler(action, () => {});
                diagnostics.log('passed', `MediaSession action '${action}' can be set`);
            } catch (error) {
                diagnostics.log('warnings', `MediaSession action '${action}' error`, {
                    error: error.message,
                    suggestion: 'This action may not be supported on this platform'
                });
            }
        });
    } else {
        diagnostics.log('warnings', 'MediaSession API not supported', {
            browser: navigator.userAgent,
            impact: 'System media controls won\'t be available'
        });
    }
    
    // ============================================================================
    // ENHANCED UI FUNCTIONALITY CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 5: UI System Deep Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // Theme system analysis
    const html = document.documentElement;
    const themeClasses = ['light', 'medium', 'dark'];
    const activeThemes = themeClasses.filter(theme => html.classList.contains(theme));
    
    if (activeThemes.length > 1) {
        diagnostics.log('warnings', 'Multiple theme classes active', {
            activeThemes,
            suggestion: 'Only one theme should be active at a time'
        });
    } else if (activeThemes.length === 0) {
        diagnostics.log('warnings', 'No theme class detected', {
            defaultTheme: 'dark',
            suggestion: 'Add a default theme class to html element'
        });
    } else {
        diagnostics.log('passed', `Current theme: ${activeThemes[0]}`, {
            activeTheme: activeThemes[0],
            availableThemes: themeClasses
        });
    }
    
    // CSS custom properties analysis
    const computedStyle = getComputedStyle(html);
    const cssVariables = [
        '--primary-color', '--secondary-color', '--background-color',
        '--text-color', '--accent-color', '--border-color'
    ];
    
    cssVariables.forEach(variable => {
        const value = computedStyle.getPropertyValue(variable);
        if (!value.trim()) {
            diagnostics.log('suggestions', `CSS custom property not set: ${variable}`, {
                impact: 'Theming may not work properly'
            });
        } else {
            diagnostics.log('passed', `CSS custom property found: ${variable}`, {
                value: value.trim()
            });
        }
    });
    
    // ============================================================================
    // ENHANCED LOCAL STORAGE CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 6: Local Storage Deep Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    const storageKeys = {
        'theme-preference': { type: 'string', description: 'Theme preference setting' },
        'favoriteSongs': { type: 'array', description: 'User favorite songs' },
        'favoriteArtists': { type: 'array', description: 'User favorite artists' },
        'recentlyPlayed': { type: 'array', description: 'Recently played songs history' },
        'queue': { type: 'array', description: 'Current playback queue' },
        'playlists': { type: 'object', description: 'User-created playlists' },
        'volume': { type: 'number', description: 'Saved volume level' },
        'currentPosition': { type: 'number', description: 'Last playback position' }
    };
    
    // Check localStorage availability
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        diagnostics.log('passed', 'localStorage is available and functional');
    } catch (error) {
        diagnostics.log('critical', 'localStorage is not available', {
            error: error.message,
            impact: 'User preferences and data persistence will not work',
            suggestions: [
                'Check if browser has localStorage disabled',
                'Implement fallback storage mechanism',
                'Check for privacy/incognito mode restrictions'
            ]
        });
    }
    
    Object.entries(storageKeys).forEach(([key, config]) => {
        try {
            const value = localStorage.getItem(key);
            if (value === null) {
                diagnostics.log('suggestions', `LocalStorage key '${key}' not found`, {
                    description: config.description,
                    suggestion: 'This will be created when user interacts with the feature'
                });
            } else {
                try {
                    const parsed = JSON.parse(value);
                    const actualType = diagnostics.getDetailedType(parsed);
                    
                    if (!diagnostics.typeMatches(parsed, config.type)) {
                        diagnostics.log('warnings', `LocalStorage key '${key}' type mismatch`, {
                            expected: config.type,
                            actual: actualType,
                            value: diagnostics.safeStringify(parsed)
                        });
                    } else {
                        diagnostics.log('passed', `LocalStorage key '${key}' found and valid`, {
                            type: actualType,
                            description: config.description,
                            preview: diagnostics.safeStringify(parsed, 50)
                        });
                    }
                } catch (parseError) {
                    // Not JSON, might be plain string
                    if (config.type === 'string') {
                        diagnostics.log('passed', `LocalStorage key '${key}' found (string)`, {
                            value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
                            description: config.description
                        });
                    } else {
                        diagnostics.log('warnings', `LocalStorage key '${key}' parse error`, {
                            error: parseError.message,
                            rawValue: value.substring(0, 100),
                            suggestion: 'Data may be corrupted or in wrong format'
                        });
                    }
                }
            }
        } catch (error) {
            diagnostics.log('warnings', `LocalStorage access error for key '${key}'`, {
                error: error.message
            });
        }
    });
    
    // Check total localStorage usage
    try {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        
        const usageInfo = {
            totalKeys: Object.keys(localStorage).length,
            totalSizeBytes: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            estimatedLimit: '5-10MB (browser dependent)'
        };
        
        diagnostics.log('passed', 'LocalStorage usage analyzed', usageInfo);
        
        if (totalSize > 1024 * 1024) { // > 1MB
            diagnostics.log('warnings', 'LocalStorage usage is high', {
                ...usageInfo,
                suggestion: 'Consider implementing data cleanup or compression'
            });
        }
    } catch (error) {
        diagnostics.log('warnings', 'Could not analyze localStorage usage', {
            error: error.message
        });
    }
    
    // ============================================================================
    // ENHANCED EVENT BINDING CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 7: Event System Deep Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // Critical interactive elements
    const interactiveElements = [
        { id: 'play-pause-navbar', events: ['click'], critical: true },
        { id: 'menu-trigger', events: ['click'], critical: true },
        { id: 'now-playing-area', events: ['click'], critical: true },
        { id: 'theme-toggle', events: ['click'], critical: true },
        { id: 'prev-btn-navbar', events: ['click'], critical: false },
        { id: 'next-btn-navbar', events: ['click'], critical: false },
        { id: 'popup-progress-bar', events: ['click', 'mousedown'], critical: false },
        { id: 'popup-favorite-btn', events: ['click'], critical: false }
    ];
    
    interactiveElements.forEach(({ id, events, critical }) => {
        const element = document.getElementById(id);
        if (element) {
            const hasInteractivity = 
                element.onclick ||
                element.getAttribute('onclick') ||
                element.style.cursor === 'pointer' ||
                element.classList.contains('clickable') ||
                element.classList.contains('btn') ||
                element.classList.contains('button');
            
            if (!hasInteractivity) {
                diagnostics.log(critical ? 'warnings' : 'suggestions', 
                    `Interactive element may be missing event handlers: ${id}`, {
                    expectedEvents: events,
                    currentCursor: element.style.cursor,
                    classList: Array.from(element.classList),
                    suggestions: [
                        `Add click event listener to ${id}`,
                        'Set cursor: pointer in CSS',
                        'Add interactive class name'
                    ]
                });
            } else {
                diagnostics.log('passed', `Element appears interactive: ${id}`, {
                    indicators: {
                        hasOnclick: !!element.onclick,
                        hasOnclickAttr: !!element.getAttribute('onclick'),
                        hasPointerCursor: element.style.cursor === 'pointer',
                        hasInteractiveClass: element.classList.contains('clickable') || 
                                           element.classList.contains('btn')
                    }
                });
            }
        }
    });
    
    // Keyboard accessibility check
    const keyboardElements = document.querySelectorAll('[tabindex], button, a, input, select, textarea');
    const keyboardAnalysis = {
        totalElements: keyboardElements.length,
        elementsWithTabIndex: 0,
        negativeTabIndex: 0,
        missingTabIndex: 0
    };
    
    keyboardElements.forEach(el => {
        const tabIndex = el.getAttribute('tabindex');
        if (tabIndex !== null) {
            keyboardAnalysis.elementsWithTabIndex++;
            if (parseInt(tabIndex) < 0) {
                keyboardAnalysis.negativeTabIndex++;
            }
        } else if (el.tagName.toLowerCase() === 'div' || el.tagName.toLowerCase() === 'span') {
            keyboardAnalysis.missingTabIndex++;
        }
    });
    
    diagnostics.log('passed', 'Keyboard accessibility analyzed', keyboardAnalysis);
    
    if (keyboardAnalysis.missingTabIndex > 0) {
        diagnostics.log('accessibility', 'Some interactive elements may not be keyboard accessible', {
            analysis: keyboardAnalysis,
            suggestion: 'Add tabindex attributes to interactive non-form elements'
        });
    }
    
    // ============================================================================
    // ENHANCED PERFORMANCE CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 8: Performance Deep Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // Memory analysis
    const memoryInfo = diagnostics.analyzeMemoryUsage();
    if (memoryInfo) {
        diagnostics.log('performance', 'Memory usage analyzed', {
            heapUsed: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            heapLimit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
            usagePercentage: `${memoryInfo.usagePercentage}%`
        });
        
        if (parseFloat(memoryInfo.usagePercentage) > 75) {
            diagnostics.log('warnings', 'High memory usage detected', {
                percentage: memoryInfo.usagePercentage,
                suggestions: [
                    'Check for memory leaks',
                    'Optimize large data structures',
                    'Clean up unused event listeners'
                ]
            });
        }
    }
    
    // Network resource analysis
    const networkAnalysis = diagnostics.analyzeNetworkResources();
    diagnostics.log('performance', 'Network resources analyzed', networkAnalysis);
    
    if (networkAnalysis.failed > 0) {
        diagnostics.log('warnings', `${networkAnalysis.failed} resources failed to load`, {
            analysis: networkAnalysis,
            suggestions: [
                'Check browser network tab for failed requests',
                'Verify resource URLs are correct',
                'Check for CORS issues'
            ]
        });
    }
    
    if (networkAnalysis.slow > 0) {
        diagnostics.log('performance', `${networkAnalysis.slow} resources loaded slowly (>1s)`, {
            analysis: networkAnalysis,
            suggestions: [
                'Optimize resource sizes',
                'Use CDN for better performance',
                'Consider lazy loading for non-critical resources'
            ]
        });
    }
    
    // DOM complexity analysis
    const domAnalysis = {
        totalElements: document.querySelectorAll('*').length,
        maxDepth: 0,
        scriptsCount: document.querySelectorAll('script').length,
        stylesheetsCount: document.querySelectorAll('link[rel="stylesheet"]').length,
        imagesCount: document.querySelectorAll('img').length,
        audioElements: document.querySelectorAll('audio').length
    };
    
    // Calculate maximum DOM depth
    function getMaxDepth(element, currentDepth = 0) {
        let maxDepth = currentDepth;
        for (let child of element.children) {
            maxDepth = Math.max(maxDepth, getMaxDepth(child, currentDepth + 1));
        }
        return maxDepth;
    }
    domAnalysis.maxDepth = getMaxDepth(document.body);
    
    diagnostics.log('performance', 'DOM complexity analyzed', domAnalysis);
    
    if (domAnalysis.totalElements > 1000) {
        diagnostics.log('performance', 'High DOM element count', {
            count: domAnalysis.totalElements,
            suggestion: 'Consider virtualizing large lists or optimizing DOM structure'
        });
    }
    
    if (domAnalysis.audioElements > 1) {
        diagnostics.log('warnings', `Multiple audio elements detected: ${domAnalysis.audioElements}`, {
            impact: 'May cause memory leaks or conflicts',
            suggestion: 'Ensure only one audio element is active at a time'
        });
    }
    
    // Event listener analysis
    const eventAnalysis = diagnostics.analyzeEventListeners();
    if (eventAnalysis.totalListeners > 0) {
        diagnostics.log('performance', 'Event listeners analyzed', eventAnalysis);
        
        if (eventAnalysis.heavyElements.length > 0) {
            diagnostics.log('performance', 'Elements with many event listeners found', {
                heavyElements: eventAnalysis.heavyElements,
                suggestion: 'Consider event delegation to reduce memory usage'
            });
        }
    }
    
    // ============================================================================
    // ENHANCED SECURITY & ACCESSIBILITY CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 9: Security & Accessibility Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // Content Security Policy check
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
        diagnostics.log('security', 'Content Security Policy found', {
            content: cspMeta.getAttribute('content')
        });
    } else {
        diagnostics.log('suggestions', 'No Content Security Policy detected', {
            suggestion: 'Consider adding CSP headers for security'
        });
    }
    
    // HTTPS check
    if (location.protocol === 'https:') {
        diagnostics.log('security', 'Site is served over HTTPS');
    } else if (location.protocol === 'http:' && location.hostname !== 'localhost') {
        diagnostics.log('security', 'Site is not served over HTTPS', {
            currentProtocol: location.protocol,
            suggestion: 'Use HTTPS for production deployment'
        });
    }
    
    // Accessibility checks
    const accessibilityChecks = {
        altTexts: 0,
        missingAltTexts: 0,
        ariaLabels: 0,
        headingStructure: [],
        focusableElements: 0
    };
    
    // Check images for alt text
    document.querySelectorAll('img').forEach(img => {
        if (img.alt) {
            accessibilityChecks.altTexts++;
        } else {
            accessibilityChecks.missingAltTexts++;
        }
    });
    
    // Check for ARIA labels
    accessibilityChecks.ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length;
    
    // Check heading structure
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        const count = document.querySelectorAll(tag).length;
        if (count > 0) {
            accessibilityChecks.headingStructure.push({ tag, count });
        }
    });
    
    // Check focusable elements
    accessibilityChecks.focusableElements = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    ).length;
    
    diagnostics.log('accessibility', 'Accessibility features analyzed', accessibilityChecks);
    
    if (accessibilityChecks.missingAltTexts > 0) {
        diagnostics.log('accessibility', `${accessibilityChecks.missingAltTexts} images missing alt text`, {
            suggestion: 'Add descriptive alt text to all images'
        });
    }
    
    if (accessibilityChecks.ariaLabels === 0) {
        diagnostics.log('accessibility', 'No ARIA labels found', {
            suggestion: 'Consider adding ARIA labels for better screen reader support'
        });
    }
    
    // ============================================================================
    // ENHANCED PLACEHOLDER FUNCTION DETECTION
    // ============================================================================
    
    console.log('%c🔍 PHASE 10: Code Quality Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    const checkForPlaceholders = (obj, path = '', depth = 0) => {
        if (!obj || typeof obj !== 'object' || depth > 5) return;
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof value === 'function') {
                diagnostics.checkPlaceholder(value, currentPath);
                
                // Additional code quality checks
                const funcString = value.toString();
                
                // Check for console.log statements (potential debugging code)
                if (funcString.includes('console.log') && !funcString.includes('console.log') < 2) {
                    diagnostics.log('suggestions', `Function contains console.log statements: ${currentPath}`, {
                        suggestion: 'Remove debugging console.log statements for production'
                    });
                }
                
                // Check for TODO comments
                if (funcString.toLowerCase().includes('todo')) {
                    diagnostics.log('suggestions', `Function contains TODO comments: ${currentPath}`, {
                        suggestion: 'Address TODO items before production'
                    });
                }
                
                // Check for empty catch blocks
                if (funcString.includes('catch') && funcString.includes('{}')) {
                    diagnostics.log('warnings', `Function has empty catch block: ${currentPath}`, {
                        suggestion: 'Add proper error handling in catch blocks'
                    });
                }
                
            } else if (typeof value === 'object' && value !== null && depth < 3) {
                checkForPlaceholders(value, currentPath, depth + 1);
            }
        });
    };
    
    // Check global objects for placeholders
    if (window.musicAppAPI) checkForPlaceholders(window.musicAppAPI, 'musicAppAPI');
    if (window.appState) checkForPlaceholders(window.appState, 'appState');
    if (window.render) checkForPlaceholders(window.render, 'render');
    
    // ============================================================================
    // ENHANCED INTEGRATION TESTING
    // ============================================================================
    
    console.log('%c🔍 PHASE 11: Integration Testing', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // Test basic functionality flows
    const integrationTests = {
        musicDataFlow: false,
        playerIntegration: false,
        uiUpdates: false,
        storageIntegration: false,
        themeSystem: false
    };
    
    // Test music data flow
    if (window.music && window.music.length > 0 && window.musicAppAPI?.player?.playSong) {
        integrationTests.musicDataFlow = true;
        diagnostics.log('passed', 'Music data flow appears functional', {
            dataSource: 'window.music',
            playerAPI: 'window.musicAppAPI.player.playSong'
        });
    } else {
        diagnostics.log('warnings', 'Music data flow may be broken', {
            hasData: !!(window.music && window.music.length > 0),
            hasPlayer: !!(window.musicAppAPI?.player?.playSong),
            suggestion: 'Verify music data loading and player API integration'
        });
    }
    
    // Test player integration
    if (window.appState?.audio && window.musicAppAPI?.player) {
        integrationTests.playerIntegration = true;
        diagnostics.log('passed', 'Player integration appears functional', {
            audioElement: 'appState.audio',
            playerAPI: 'musicAppAPI.player'
        });
    } else {
        diagnostics.log('warnings', 'Player integration may be incomplete', {
            hasAudio: !!(window.appState?.audio),
            hasPlayerAPI: !!(window.musicAppAPI?.player),
            suggestion: 'Ensure audio element and player API are properly connected'
        });
    }
    
    // Test UI updates
    if (window.musicAppAPI?.ui && document.getElementById('now-playing-area')) {
        integrationTests.uiUpdates = true;
        diagnostics.log('passed', 'UI update system appears functional');
    } else {
        diagnostics.log('warnings', 'UI update system may be incomplete', {
            hasUIAPI: !!(window.musicAppAPI?.ui),
            hasUIElements: !!document.getElementById('now-playing-area'),
            suggestion: 'Verify UI API and DOM elements are properly connected'
        });
    }
    
    // Test storage integration
    try {
        const testKey = 'diagnostics-test';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        integrationTests.storageIntegration = true;
        diagnostics.log('passed', 'Storage integration is functional');
    } catch (e) {
        diagnostics.log('warnings', 'Storage integration may not work', {
            error: e.message
        });
    }
       // Test theme system
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && window.musicAppAPI?.theme?.toggle) {
        integrationTests.themeSystem = true;
        diagnostics.log('passed', 'Theme system integration appears functional');
    } else {
        diagnostics.log('warnings', 'Theme system integration may be incomplete', {
            hasThemeToggle: !!themeToggle,
            hasThemeAPI: !!(window.musicAppAPI?.theme?.toggle),
            suggestion: 'Verify theme toggle element and API are properly connected'
        });
    }
    
    // ============================================================================
    // CRITICAL PATH ANALYSIS
    // ============================================================================
    
    console.log('%c🔍 PHASE 12: Critical Path Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // Analyze the critical user journey paths
    const criticalPaths = {
        appInitialization: {
            steps: [
                { name: 'Music data loaded', status: !!(window.music && window.music.length > 0) },
                { name: 'App state initialized', status: !!window.appState },
                { name: 'Audio element created', status: !!(window.appState?.audio) },
                { name: 'Player API available', status: !!(window.musicAppAPI?.player) },
                { name: 'UI API available', status: !!(window.musicAppAPI?.ui) }
            ]
        },
        playbackFlow: {
            steps: [
                { name: 'Song selection possible', status: !!(window.music && window.music.length > 0) },
                { name: 'Play function exists', status: !!(window.musicAppAPI?.player?.playSong) },
                { name: 'Audio element ready', status: !!(window.appState?.audio instanceof Audio) },
                { name: 'UI update functions exist', status: !!(window.musicAppAPI?.ui?.updateNowPlaying) },
                { name: 'Play/pause controls exist', status: !!document.getElementById('play-pause-navbar') }
            ]
        },
        userInteraction: {
            steps: [
                { name: 'Interactive elements present', status: !!document.getElementById('menu-trigger') },
                { name: 'Theme toggle functional', status: !!(document.getElementById('theme-toggle') && window.musicAppAPI?.theme) },
                { name: 'Navigation elements present', status: !!document.getElementById('dynamic-content') },
                { name: 'Storage system functional', status: typeof Storage !== 'undefined' }
            ]
        }
    };
    
    Object.entries(criticalPaths).forEach(([pathName, pathData]) => {
        const completedSteps = pathData.steps.filter(step => step.status).length;
        const totalSteps = pathData.steps.length;
        const completionRate = (completedSteps / totalSteps * 100).toFixed(1);
        
        if (completionRate === '100.0') {
            diagnostics.log('passed', `Critical path '${pathName}' is complete`, {
                completion: `${completedSteps}/${totalSteps} (${completionRate}%)`,
                allStepsStatus: pathData.steps
            });
        } else if (completionRate >= '80.0') {
            diagnostics.log('warnings', `Critical path '${pathName}' is mostly complete`, {
                completion: `${completedSteps}/${totalSteps} (${completionRate}%)`,
                failedSteps: pathData.steps.filter(step => !step.status),
                allStepsStatus: pathData.steps
            });
        } else {
            diagnostics.log('critical', `Critical path '${pathName}' has major issues`, {
                completion: `${completedSteps}/${totalSteps} (${completionRate}%)`,
                failedSteps: pathData.steps.filter(step => !step.status),
                allStepsStatus: pathData.steps,
                impact: 'Core functionality may not work properly'
            });
        }
    });
    
    // ============================================================================
    // BROWSER COMPATIBILITY CHECK
    // ============================================================================
    
    console.log('%c🔍 PHASE 13: Browser Compatibility Analysis', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    const browserFeatures = {
        localStorage: typeof Storage !== 'undefined',
        audioAPI: typeof Audio !== 'undefined',
        mediaSession: 'mediaSession' in navigator,
        serviceWorker: 'serviceWorker' in navigator,
        webAudio: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
        notifications: 'Notification' in window,
        fullscreen: document.fullscreenEnabled || document.webkitFullscreenEnabled,
        geolocation: 'geolocation' in navigator,
        deviceOrientation: 'DeviceOrientationEvent' in window,
        touchEvents: 'ontouchstart' in window,
        pointerEvents: 'PointerEvent' in window,
        intersectionObserver: 'IntersectionObserver' in window,
        mutationObserver: 'MutationObserver' in window,
        fetchAPI: 'fetch' in window,
        promises: typeof Promise !== 'undefined',
        es6Classes: (function() { try { eval('class Test {}'); return true; } catch(e) { return false; } })(),
        es6Modules: 'import' in document.createElement('script'),
        css3Animations: CSS.supports('animation-name', 'test'),
        css3Transforms: CSS.supports('transform', 'translateX(1px)'),
        cssGrid: CSS.supports('display', 'grid'),
        cssFlexbox: CSS.supports('display', 'flex')
    };
    
    const criticalFeatures = ['localStorage', 'audioAPI', 'fetchAPI', 'promises'];
    const enhancementFeatures = ['mediaSession', 'notifications', 'serviceWorker'];
    const modernFeatures = ['intersectionObserver', 'es6Classes', 'cssGrid', 'cssFlexbox'];
    
    const featureAnalysis = {
        critical: { supported: 0, total: criticalFeatures.length },
        enhancement: { supported: 0, total: enhancementFeatures.length },
        modern: { supported: 0, total: modernFeatures.length },
        unsupported: []
    };
    
    Object.entries(browserFeatures).forEach(([feature, supported]) => {
        if (!supported) {
            featureAnalysis.unsupported.push(feature);
        }
        
        if (criticalFeatures.includes(feature) && supported) {
            featureAnalysis.critical.supported++;
        } else if (enhancementFeatures.includes(feature) && supported) {
            featureAnalysis.enhancement.supported++;
        } else if (modernFeatures.includes(feature) && supported) {
            featureAnalysis.modern.supported++;
        }
    });
    
    // Browser detection
    const userAgent = navigator.userAgent;
    const browserInfo = {
        userAgent: userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        vendorSub: navigator.vendorSub
    };
    
    diagnostics.log('passed', 'Browser compatibility analyzed', {
        browserInfo,
        featureSupport: browserFeatures,
        featureAnalysis,
        compatibility: {
            critical: `${featureAnalysis.critical.supported}/${featureAnalysis.critical.total}`,
            enhancement: `${featureAnalysis.enhancement.supported}/${featureAnalysis.enhancement.total}`,
            modern: `${featureAnalysis.modern.supported}/${featureAnalysis.modern.total}`
        }
    });
    
    if (featureAnalysis.critical.supported < featureAnalysis.critical.total) {
        diagnostics.log('critical', 'Critical browser features missing', {
            missingFeatures: criticalFeatures.filter(feature => !browserFeatures[feature]),
            impact: 'Core functionality will not work',
            suggestion: 'Consider polyfills or graceful degradation'
        });
    }
    
    if (featureAnalysis.unsupported.length > 0) {
        diagnostics.log('warnings', 'Some browser features not supported', {
            unsupportedFeatures: featureAnalysis.unsupported,
            impact: 'Some features may not work as expected',
            suggestion: 'Test thoroughly on target browsers'
        });
    }
    
    // ============================================================================
    // ERROR MONITORING SETUP
    // ============================================================================
    
    console.log('%c🔍 PHASE 14: Error Monitoring Setup', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    
    // Capture and analyze JavaScript errors
    const errorCollector = {
        errors: [],
        warnings: [],
        unhandledRejections: [],
        originalOnError: window.onerror,
        originalOnUnhandledRejection: window.onunhandledrejection
    };
    
    // Enhanced error handler
    window.onerror = function(message, source, lineno, colno, error) {
        const errorInfo = {
            message: message,
            source: source,
            line: lineno,
            column: colno,
            error: error?.message,
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        errorCollector.errors.push(errorInfo);
        
        diagnostics.log('critical', 'JavaScript error detected', {
            errorDetails: errorInfo,
            location: `${source}:${lineno}:${colno}`,
            suggestion: 'Check browser console for full error details'
        });
        
        // Call original handler if it exists
        if (errorCollector.originalOnError) {
            return errorCollector.originalOnError.apply(this, arguments);
        }
        
        return false;
    };
    
    // Unhandled promise rejection handler
    window.onunhandledrejection = function(event) {
        const rejectionInfo = {
            reason: event.reason,
            promise: event.promise,
            timestamp: new Date().toISOString(),
            stack: event.reason?.stack
        };
        
        errorCollector.unhandledRejections.push(rejectionInfo);
        
        diagnostics.log('critical', 'Unhandled promise rejection detected', {
            rejectionDetails: rejectionInfo,
            suggestion: 'Add proper .catch() handlers to promises'
        });
        
        // Call original handler if it exists
        if (errorCollector.originalOnUnhandledRejection) {
            return errorCollector.originalOnUnhandledRejection.apply(this, arguments);
        }
    };
    
    // Console error monitoring
    const originalConsoleError = console.error;
    console.error = function(...args) {
        errorCollector.warnings.push({
            arguments: args,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
        });
        
        originalConsoleError.apply(console, args);
    };
    
    // ============================================================================
    // FINAL REPORT GENERATION
    // ============================================================================
    
    setTimeout(() => {
        const endTime = performance.now();
        const diagnosticDuration = ((endTime - diagnostics.startTime) / 1000).toFixed(2);
        
        console.log('%c' + '='.repeat(80), 'color: #2196F3;');
        console.log('%c🎵 MYTUNESAPP DIAGNOSTIC REPORT - COMPLETE', 'color: #4CAF50; font-size: 18px; font-weight: bold;');
        console.log('%c' + '='.repeat(80), 'color: #2196F3;');
        
        const { critical, warnings, missing, placeholders, suggestions, passed, performance: perf, security, accessibility } = diagnostics.results;
        
        // Enhanced summary with color coding
        console.log('%c📊 EXECUTIVE SUMMARY', 'color: #2196F3; font-size: 16px; font-weight: bold;');
        console.log(`%c✅ Passed Checks: ${passed.length}`, 'color: #4CAF50; font-weight: bold;');
        console.log(`%c⚠️  Warnings: ${warnings.length}`, 'color: #FF9800; font-weight: bold;');
        console.log(`%c❌ Critical Issues: ${critical.length}`, 'color: #F44336; font-weight: bold;');
        console.log(`%c🔍 Missing Components: ${missing.length}`, 'color: #9C27B0; font-weight: bold;');
        console.log(`%c📝 Placeholder Functions: ${placeholders.length}`, 'color: #607D8B; font-weight: bold;');
        console.log(`%c💡 Suggestions: ${suggestions.length}`, 'color: #2196F3; font-weight: bold;');
        console.log(`%c🚀 Performance Issues: ${perf.length}`, 'color: #FF5722; font-weight: bold;');
        console.log(`%c🔒 Security Notes: ${security.length}`, 'color: #795548; font-weight: bold;');
        console.log(`%c♿ Accessibility Notes: ${accessibility.length}`, 'color: #009688; font-weight: bold;');
        
        // Health Score Calculation
        const totalChecks = Object.values(diagnostics.results).flat().length;
        const positiveChecks = passed.length;
        const criticalWeight = critical.length * 3;
        const warningWeight = warnings.length * 1.5;
        const missingWeight = missing.length * 2;
        
        const healthScore = Math.max(0, Math.min(100, 
            ((positiveChecks / totalChecks) * 100) - 
            (criticalWeight * 5) - 
            (warningWeight * 2) - 
            (missingWeight * 3)
        )).toFixed(1);
        
        let healthStatus = 'EXCELLENT';
        let healthColor = '#4CAF50';
        if (healthScore < 90) { healthStatus = 'GOOD'; healthColor = '#8BC34A'; }
        if (healthScore < 75) { healthStatus = 'FAIR'; healthColor = '#FF9800'; }
        if (healthScore < 60) { healthStatus = 'POOR'; healthColor = '#FF5722'; }
        if (healthScore < 40) { healthStatus = 'CRITICAL'; healthColor = '#F44336'; }
        
        console.log(`%c🏥 HEALTH SCORE: ${healthScore}% (${healthStatus})`, 
            `color: ${healthColor}; font-size: 16px; font-weight: bold; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;`);
        
        // Detailed sections with precise locations
        if (critical.length > 0) {
            console.log('%c\n🚨 CRITICAL ISSUES (Fix Immediately)', 'color: #F44336; font-size: 14px; font-weight: bold;');
            critical.forEach((issue, i) => {
                console.log(`%c${i + 1}. ${issue.message}`, 'color: #F44336; font-weight: bold;');
                if (issue.location) console.log(`   📍 Location: ${issue.location}`);
                if (issue.details) {
                    console.log('   📋 Details:', issue.details);
                    if (issue.details.suggestions) {
                        console.log('   💡 Suggestions:');
                        issue.details.suggestions.forEach(suggestion => {
                            console.log(`      • ${suggestion}`);
                        });
                    }
                }
                if (issue.stack) {
                    console.log(`   🔍 Stack trace available in diagnosticResults[${i}].stack`);
                }
                console.log('   ⏰ Timestamp:', issue.timestamp);
                console.log(''); // Empty line for readability
            });
        }
        
        if (missing.length > 0) {
            console.log('%c🔍 MISSING COMPONENTS', 'color: #9C27B0; font-size: 14px; font-weight: bold;');
            missing.forEach((issue, i) => {
                console.log(`%c${i + 1}. ${issue.message}`, 'color: #9C27B0;');
                if (issue.location) console.log(`   📍 Location: ${issue.location}`);
                if (issue.details) {
                    console.log('   📋 Details:', issue.details);
                    if (issue.details.suggestions) {
                        console.log('   💡 Fix suggestions:');
                        issue.details.suggestions.forEach(suggestion => {
                            console.log(`      • ${suggestion}`);
                        });
                    }
                }
            });
        }
        
        if (warnings.length > 0) {
            console.log('%c\n⚠️  WARNINGS (Recommended Fixes)', 'color: #FF9800; font-size: 14px; font-weight: bold;');
            warnings.forEach((issue, i) => {
                console.log(`%c${i + 1}. ${issue.message}`, 'color: #FF9800;');
                if (issue.location) console.log(`   📍 Location: ${issue.location}`);
                if (issue.details) {
                    console.log('   📋 Details:', issue.details);
                }
            });
        }
        
        if (placeholders.length > 0) {
            console.log('%c\n📝 PLACEHOLDER FUNCTIONS (Need Implementation)', 'color: #607D8B; font-size: 14px; font-weight: bold;');
            placeholders.forEach((issue, i) => {
                console.log(`%c${i + 1}. ${issue.message}`, 'color: #607D8B;');
                if (issue.location) console.log(`   📍 Location: ${issue.location}`);
                if (issue.details?.keywords) {
                    console.log(`   🔑 Keywords found: ${issue.details.keywords.join(', ')}`);
                }
                if (issue.details?.suggestions) {
                    console.log('   💡 Implementation suggestions:');
                    issue.details.suggestions.forEach(suggestion => {
                        console.log(`      • ${suggestion}`);
                    });
                }
            });
        }
        
        if (perf.length > 0) {
            console.log('%c\n🚀 PERFORMANCE INSIGHTS', 'color: #FF5722; font-size: 14px; font-weight: bold;');
            perf.forEach((issue, i) => {
                console.log(`%c${i + 1}. ${issue.message}`, 'color: #FF5722;');
                if (issue.details) console.log('   📊 Metrics:', issue.details);
            });
        }
        
        if (accessibility.length > 0) {
            console.log('%c\n♿ ACCESSIBILITY RECOMMENDATIONS', 'color: #009688; font-size: 14px; font-weight: bold;');
            accessibility.forEach((issue, i) => {
                console.log(`%c${i + 1}. ${issue.message}`, 'color: #009688;');
                if (issue.details) console.log('   📋 Details:', issue.details);
            });
        }
        
        // Priority action plan
        console.log('%c\n🎯 PRIORITY ACTION PLAN', 'color: #2196F3; font-size: 16px; font-weight: bold;');
        
        if (critical.length > 0) {
            console.log('%c🚨 IMMEDIATE (Fix within hours)', 'color: #F44336; font-weight: bold;');
            console.log('   • Resolve all critical issues - app may not function');
            console.log(`   • Focus on: ${critical.slice(0, 3).map(c => c.message.split(':')[0]).join(', ')}`);
        }
        
        if (missing.length > 0) {
            console.log('%c🔍 HIGH PRIORITY (Fix within days)', 'color: #9C27B0; font-weight: bold;');
            console.log('   • Implement missing core components');
            console.log(`   • Focus on: ${missing.slice(0, 3).map(m => m.message.split(':')[0]).join(', ')}`);
        }
        
        if (placeholders.length > 0) {
            console.log('%c📝 MEDIUM PRIORITY (Fix within week)', 'color: #607D8B; font-weight: bold;');
            console.log('   • Replace placeholder functions with actual implementations');
            console.log(`   • ${placeholders.length} placeholder functions need implementation`);
        }
        
        if (warnings.length > 0) {
            console.log('%c⚠️  LOW PRIORITY (Fix when possible)', 'color: #FF9800; font-weight: bold;');
            console.log('   • Address warnings for better reliability');
            console.log(`   • ${warnings.length} warnings to review`);
        }
        
        // Integration tests recommendations
        console.log('%c\n🧪 RECOMMENDED TESTS', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
        console.log('1. Load music data and verify structure');
        console.log('2. Test audio playback with actual files');
        console.log('3. Verify theme switching functionality');
        console.log('4. Test responsive design on mobile devices');
        console.log('5. Verify localStorage persistence across sessions');
        console.log('6. Test keyboard navigation and accessibility');
        console.log('7. Verify error handling for edge cases');
        
        // Development environment info
        console.log('%c\n🔧 DEVELOPMENT INFO', 'color: #795548; font-size: 14px; font-weight: bold;');
        console.log(`Diagnostic completed in ${diagnosticDuration}s`);
        console.log(`Total checks performed: ${totalChecks}`);
        console.log(`Browser: ${navigator.userAgent.split(' ').slice(-2).join(' ')}`);
        console.log(`Timestamp: ${new Date().toLocaleString()}`);
        console.log(`Memory usage: ${performance.memory ? 
            `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'Not available'}`);
        
        // Save detailed results
        window.diagnosticResults = {
            ...diagnostics.results,
            metadata: {
                healthScore: parseFloat(healthScore),
                healthStatus,
                totalChecks,
                duration: parseFloat(diagnosticDuration),
                timestamp: new Date().toISOString(),
                browser: navigator.userAgent,
                integrationTests,
                criticalPaths
            },
            errorCollector
        };
        
        console.log('%c\n💾 RESULTS SAVED', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
        console.log('Detailed results saved to: window.diagnosticResults');
        console.log('Access specific categories: window.diagnosticResults.critical, .warnings, etc.');
        console.log('Error monitoring active: window.diagnosticResults.errorCollector');
        
        // Final status message
        if (healthScore >= 80) {
            console.log('%c\n🎉 Your MyTunes app is in good shape! Address the remaining issues when possible.', 
                'color: #4CAF50; font-size: 16px; font-weight: bold; background: rgba(76, 175, 80, 0.1); padding: 8px; border-radius: 4px;');
        } else if (healthScore >= 60) {
            console.log('%c\n⚡ Your MyTunes app needs attention. Focus on critical and missing components first.', 
                'color: #FF9800; font-size: 16px; font-weight: bold; background: rgba(255, 152, 0, 0.1); padding: 8px; border-radius: 4px;');
        } else {
            console.log('%c\n🚨 Your MyTunes app needs significant work. Start with critical issues immediately.', 
                'color: #F44336; font-size: 16px; font-weight: bold; background: rgba(244, 67, 54, 0.1); padding: 8px; border-radius: 4px;');
        }
        
        console.log('%c' + '='.repeat(80), 'color: #2196F3;');
        console.log('%c🎵 DIAGNOSTIC COMPLETE - Happy Coding! 🎵', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
        console.log('%c' + '='.repeat(80), 'color: #2196F3;');
        
        // Restore original error handlers after a delay
        setTimeout(() => {
            window.onerror = errorCollector.originalOnError;
            window.onunhandledrejection = errorCollector.originalOnUnhandledRejection;
            console.error = originalConsoleError;
        }, 60000); // Keep monitoring for 1 minute
        
    }, 2000); // Increased delay to allow all async checks to complete
    
})();

// ============================================================================
// ENHANCED HELPER FUNCTIONS & TESTING UTILITIES
// ============================================================================

// Enhanced test functions with better error handling and reporting
window.testMusicApp = {
    // Test random song playback
    playRandomSong: function() {
        try {
            if (!window.music || window.music.length === 0) {
                console.error('❌ No music library available');
                return { success: false, error: 'No music data' };
            }
            
            const randomArtist = window.music[Math.floor(Math.random() * window.music.length)];
            if (!randomArtist.albums || randomArtist.albums.length === 0) {
                console.error('❌ No albums found for artist:', randomArtist.artist);
                return { success: false, error: 'No albums available' };
            }
            
            const randomAlbum = randomArtist.albums[Math.floor(Math.random() * randomArtist.albums.length)];
            if (!randomAlbum.songs || randomAlbum.songs.length === 0) {
                console.error('❌ No songs found in album:', randomAlbum.album);
                return { success: false, error: 'No songs available' };
            }
            
            const randomSong = randomAlbum.songs[Math.floor(Math.random() * randomAlbum.songs.length)];
            const songData = {
                ...randomSong,
                artist: randomArtist.artist,
                album: randomAlbum.album
            };
            
            if (window.musicAppAPI?.player?.playSong) {
                const result = window.musicAppAPI.player.playSong(songData);
                console.log('%c🎵 Playing random song:', 'color: #4CAF50; font-weight: bold;', songData.title, 'by', songData.artist);
                return { success: true, song: songData, result };
            } else {
                console.error('❌ Player API not available');
                return { success: false, error: 'Player API missing' };
            }
        } catch (error) {
            console.error('❌ Error playing random song:', error);
            return { success: false, error: error.message, stack: error.stack };
        }
    },
    
    // Test theme toggle with validation
    testThemeToggle: function() {
        try {
            const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 
                               document.documentElement.classList.contains('medium') ? 'medium' : 'dark';
            
            if (window.musicAppAPI?.theme?.toggle) {
                const result = window.musicAppAPI.theme.toggle();
                
                // Wait a bit for theme change to apply
                setTimeout(() => {
                    const newTheme = document.documentElement.classList.contains('light') ? 'light' : 
                                   document.documentElement.classList.contains('medium') ? 'medium' : 'dark';
                    
                    if (newTheme !== currentTheme) {
                        console.log('%c🎨 Theme toggled successfully:', 'color: #4CAF50; font-weight: bold;', 
                                  `${currentTheme} → ${newTheme}`);
                    } else {
                        console.warn('⚠️ Theme may not have changed:', currentTheme);
                    }
                }, 100);
                
                return { success: true, oldTheme: currentTheme, result };
            } else {
                console.error('❌ Theme toggle API not available');
                return { success: false, error: 'Theme API missing' };
            }
        } catch (error) {
            console.error('❌ Error toggling theme:', error);
            return { success: false, error: error.message, stack: error.stack };
        }
    },
    
    // Test notification system
    testNotification: function(message = 'Test notification from diagnostic script', type = 'info') {
        try {
            if (window.musicAppAPI?.notifications?.show) {
                const result = window.musicAppAPI.notifications.show(message, type);
                console.log('%c🔔 Test notification sent:', 'color: #4CAF50; font-weight: bold;', message);
                return { success: true, message, type, result };
            } else if (window.musicAppAPI?.ui?.showNotification) {
                const result = window.musicAppAPI.ui.showNotification(message, type);
                console.log('%c🔔 Test notification sent via UI API:', 'color: #4CAF50; font-weight: bold;', message);
                return { success: true, message, type, result, method: 'ui.showNotification' };
            } else {
                console.log('🔕 No notification API available - testing browser notification');
                
                if ('Notification' in window) {
                    if (Notification.permission === 'granted') {
                        new Notification('MyTunes Test', { body: message });
                        console.log('%c🔔 Browser notification sent', 'color: #4CAF50;');
                        return { success: true, method: 'browser', message };
                    } else {
                        console.log('🔕 Browser notifications not permitted');
                        return { success: false, error: 'Browser notifications not permitted' };
                    }
                } else {
                    console.log('🔕 No notification system available');
                    return { success: false, error: 'No notification system available' };
                }
            }
        } catch (error) {
            console.error('❌ Error testing notifications:', error);
            return { success: false, error: error.message, stack: error.stack };
        }
    },
    
    // Enhanced state inspection
    inspectState: function() {
        try {
            console.group('%c🔍 MyTunes App State Inspection', 'color: #2196F3; font-size: 14px; font-weight: bold;');
            
            // App State
            if (window.appState) {
                console.log('%cApp State:', 'color: #4CAF50; font-weight: bold;');
                console.table(window.appState);
            } else {
                console.log('%cApp State: Not available', 'color: #F44336;');
            }
            
            // Music App API
            if (window.musicAppAPI) {
                console.log('%cAvailable APIs:', 'color: #4CAF50; font-weight: bold;');
                const apis = Object.keys(window.musicAppAPI).map(key => ({
                    module: key,
                    type: typeof window.musicAppAPI[key],
                    methods: typeof window.musicAppAPI[key] === 'object' ? 
                            Object.keys(window.musicAppAPI[key]).filter(k => typeof window.musicAppAPI[key][k] === 'function') : []
                }));
                console.table(apis);
            } else {
                console.log('%cMusic App API: Not available', 'color: #F44336;');
            }
            
            // Music Library
            if (window.music && window.music.length > 0) {
                console.log('%cMusic Library:', 'color: #4CAF50; font-weight: bold;');
                const musicStats = {
                    artists: window.music.length,
                    albums: window.music.reduce((sum, artist) => sum + (artist.albums?.length || 0), 0),
                    songs: window.music.reduce((sum, artist) => 
                        sum + (artist.albums?.reduce((albumSum, album) => 
                            albumSum + (album.songs?.length || 0), 0) || 0), 0),
                    firstArtist: window.music[0]?.artist,
                    sampleSong: window.music[0]?.albums?.[0]?.songs?.[0]?.title
                };
                console.table(musicStats);
            } else {
                console.log('%cMusic Library: Not available', 'color: #F44336;');
            }
            
            // LocalStorage
            const storageKeys = Object.keys(localStorage).filter(key => 
                key.includes('music') || key.includes('theme') || key.includes('favorite'));
            if (storageKeys.length > 0) {
                console.log('%cRelevant LocalStorage Keys:', 'color: #4CAF50; font-weight: bold;');
                storageKeys.forEach(key => {
                    console.log(`${key}:`, localStorage.getItem(key)?.substring(0, 100));
                });
            } else {
                console.log('%cNo relevant LocalStorage data found', 'color: #FF9800;');
            }
            
            console.groupEnd();
            
            return {
                appState: window.appState ? 'available' : 'missing',
                musicAPI: window.musicAppAPI ? Object.keys(window.musicAppAPI) : 'missing',
                musicLibrary: window.music ? `${window.music.length} artists` : 'missing',
                localStorage: storageKeys.length + ' relevant keys'
            };
        } catch (error) {
            console.error('❌ Error inspecting state:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Test full playback cycle
    testPlaybackCycle: function() {
        try {
            console.log('%c🎯 Testing Full Playback Cycle', 'color: #2196F3; font-weight: bold;');
            
            const results = {
                steps: [],
                success: false,
                errors: []
            };
            
            // Step 1: Play a song
            const playResult = this.playRandomSong();
            results.steps.push({ step: 'Play Song', success: playResult.success, details: playResult });
            
            if (!playResult.success) {
                results.errors.push('Failed to play song');
                return results;
            }
            
            // Step 2: Test pause (after a short delay)
            setTimeout(() => {
                try {
                    if (window.musicAppAPI?.player?.pause) {
                        window.musicAppAPI.player.pause();
                        results.steps.push({ step: 'Pause', success: true });
                        console.log('⏸️ Paused playback');
                        
                        // Step 3: Test resume
                        setTimeout(() => {
                            try {
                                if (window.musicAppAPI?.player?.play) {
                                    window.musicAppAPI.player.play();
                                    results.steps.push({ step: 'Resume', success: true });
                                    console.log('▶️ Resumed playback');
                                    
                                    results.success = results.steps.every(step => step.success);
                                    console.log('%c✅ Playback cycle test complete', 'color: #4CAF50; font-weight: bold;');
                                }
                            } catch (error) {
                                results.errors.push('Resume failed: ' + error.message);
                                console.error('❌ Resume failed:', error);
                            }
                        }, 1000);
                        
                    } else {
                        results.errors.push('Pause function not available');
                        console.error('❌ Pause function not available');
                    }
                } catch (error) {
                    results.errors.push('Pause failed: ' + error.message);
                    console.error('❌ Pause failed:', error);
                }
            }, 1000);
            
            return results;
        } catch (error) {
            console.error('❌ Error in playback cycle test:', error);
            return { success: false, error: error.message };
        }
    }
};

// Enhanced utility functions
window.diagnosticUtils = {
    // Export diagnostic results
    exportResults: function(format = 'json') {
        const results = window.diagnosticResults;
        if (!results) {
            console.error('❌ No diagnostic results available');
            return;
        }
        
        try {
            let output;
            let filename;
            let mimeType;
            
            switch (format.toLowerCase()) {
                case 'json':
                    output = JSON.stringify(results, null, 2);
                    filename = `mytunesapp-diagnostic-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;
                case 'csv':
                    const allIssues = [
                        ...results.critical.map(i => ({ ...i, type: 'critical' })),
                        ...results.warnings.map(i => ({ ...i, type: 'warning' })),
                        ...results.missing.map(i => ({ ...i, type: 'missing' })),
                        ...results.placeholders.map(i => ({ ...i, type: 'placeholder' }))
                    ];
                    
                    const csvHeader = 'Type,Message,Location,Timestamp\n';
                    const csvBody = allIssues.map(issue => 
                        `${issue.type},"${issue.message}","${issue.location || 'N/A'}","${issue.timestamp}"`
                    ).join('\n');
                    
                    output = csvHeader + csvBody;
                    filename = `mytunesapp-diagnostic-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;
                default:
                    throw new Error('Unsupported format. Use "json" or "csv"');
            }
            
            const blob = new Blob([output], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            
            console.log(`%c💾 Diagnostic results exported as ${filename}`, 'color: #4CAF50; font-weight: bold;');
        } catch (error) {
            console.error('❌ Error exporting results:', error);
        }
    },
    
    // Generate summary report
    generateSummary: function() {
        const results = window.diagnosticResults;
        if (!results) return 'No diagnostic results available';
        
        const summary = `
MyTunes App Diagnostic Summary
Generated: ${new Date().toLocaleString()}
Health Score: ${results.metadata.healthScore}% (${results.metadata.healthStatus})

Issues Breakdown:
- Critical: ${results.critical.length}
- Warnings: ${results.warnings.length}
- Missing: ${results.missing.length}
- Placeholders: ${results.placeholders.length}
- Passed: ${results.passed.length}

Top Issues:
${results.critical.slice(0, 3).map((issue, i) => `${i + 1}. ${issue.message}`).join('\n')}

Recommendations:
${results.critical.length > 0 ? '- Fix critical issues immediately' : ''}
${results.missing.length > 0 ? '- Implement missing components' : ''}
${results.placeholders.length > 0 ? '- Replace placeholder functions' : ''}
${results.warnings.length > 0 ? '- Address warnings when possible' : ''}
        `;
        
        console.log(summary);
        return summary;
    }
};

console.log('%c\n🛠️  ENHANCED TEST FUNCTIONS AVAILABLE:', 'color: #2196F3; font-size: 14px; font-weight: bold;');
console.log('• testMusicApp.playRandomSong() - Test song playback');
console.log('• testMusicApp.testThemeToggle() - Test theme switching');
console.log('• testMusicApp.testNotification() - Test notification system');
console.log('• testMusicApp.inspectState() - Detailed state inspection');
console.log('• testMusicApp.testPlaybackCycle() - Test full playback cycle');
console.log('• diagnosticUtils.exportResults("json"|"csv") - Export results');
console.log('• diagnosticUtils.generateSummary() - Generate summary report');
console.log('%c\n📊 Access results: window.diagnosticResults', 'color: #4CAF50; font-weight: bold;');
console.log('%c🔍 Monitor errors: window.diagnosticResults.errorCollector', 'color: #FF9800; font-weight: bold;');
