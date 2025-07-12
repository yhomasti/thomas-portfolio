//updated spotify.js with proper background color changing
class ServerlessSpotifyIntegration {
    constructor() {
        this.baseUrl = '/.netlify/functions/spotify';
        //set fallback colors to ensure visuals always work
        this.currentColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        this.backgroundColors = ['#ff6b6b']; //separate colors for background
        this.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6']; //separate colors for particles
        this.visualsActive = false;
        this.particles = [];
        this.rhythmLines = [];
        this.currentAlbumImage = null; //track current album image for refresh detection
        this.fadeTimeout = null; //timeout for delayed fade
        this.initializeDisplay();
        this.setupVisualEffects();
    }
    
    initializeDisplay() {
        this.startMusicDisplay();
    }
    
    //create visual containers and setup hover listeners
    setupVisualEffects() {
        this.createVisualContainers();
        this.setupHoverEffects();
    }
    
    //create particle and rhythm line containers in the DOM with proper z-index
    createVisualContainers() {
        const particleContainer = document.createElement('div');
        particleContainer.id = 'music-particles';
        particleContainer.className = 'music-particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
            opacity: 0;
            transition: opacity 0.8s ease;
        `;
        document.body.appendChild(particleContainer);
        
        const rhythmContainer = document.createElement('div');
        rhythmContainer.id = 'rhythm-lines';
        rhythmContainer.className = 'rhythm-lines-container';
        rhythmContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
            opacity: 0;
            transition: opacity 0.8s ease;
        `;
        document.body.appendChild(rhythmContainer);
    }
        
    //add hover event listeners to profile picture and spotify tooltip
    setupHoverEffects() {
        const profileContainer = document.querySelector('.section__pic-container.spotify-enhanced');
        const spotifyTooltip = document.querySelector('.spotify-tooltip');
        
        if (profileContainer) {
            profileContainer.addEventListener('mouseenter', () => {
                console.log('hover detected on profile - activating visuals');
                this.cancelDeactivation(); //cancel any pending deactivation
                this.activateVisuals();
            });
            
            profileContainer.addEventListener('mouseleave', () => {
                console.log('hover ended on profile - scheduling deactivation');
                this.deactivateVisuals();
            });
        }
        
        //also listen to spotify tooltip hover to keep visuals active
        if (spotifyTooltip) {
            spotifyTooltip.addEventListener('mouseenter', () => {
                console.log('hover detected on spotify tooltip - keeping visuals active');
                this.cancelDeactivation();
            });
            
            spotifyTooltip.addEventListener('mouseleave', () => {
                console.log('hover ended on spotify tooltip - scheduling deactivation');
                this.deactivateVisuals();
            });
        }
    }
    
    //start all visual effects when hovering
    activateVisuals() {
        //ensure we always have colors available for visuals
        if (!this.backgroundColors || this.backgroundColors.length === 0) {
            console.log('no background colors available, using fallback');
            this.backgroundColors = ['#ff6b6b'];
        }
        if (!this.particleColors || this.particleColors.length === 0) {
            console.log('no particle colors available, using fallback');
            this.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        }
        
        console.log('activating visuals with background colors:', this.backgroundColors);
        console.log('activating visuals with particle colors:', this.particleColors);
        
        this.visualsActive = true;
        
        //wait a moment for album image to load if needed
        setTimeout(() => {
            this.changeBodyBackground();
        }, 100);
        
        this.startParticleSystem();
        this.startRhythmLines();
        this.applyDynamicTheme();
    }

    //stop all visual effects when not hovering (with delay)
    deactivateVisuals() {
        console.log('scheduling visuals deactivation in 2.5 seconds');
        
        //clear any existing timeout
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
        }
        
        //set timeout for delayed fade
        this.fadeTimeout = setTimeout(() => {
            console.log('deactivating visuals after delay');
            this.visualsActive = false;
            this.stopVisualEffects();
            this.resetBodyBackground();
            this.fadeTimeout = null;
        }, 2500); //2.5 second delay
    }

    //cancel scheduled deactivation (when user hovers again)
    cancelDeactivation() {
        if (this.fadeTimeout) {
            console.log('canceling scheduled deactivation');
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
    }

    //change body background to subtle gradient based on album colors with album image overlay
    changeBodyBackground() {
        console.log('changing background with colors:', this.backgroundColors);
        
        //use first color as primary background color, desaturated
        const primaryColor = this.backgroundColors[0];
        const desaturatedColor = this.desaturateColor(primaryColor, 0.3); //30% saturation
        const lighterColor = this.lightenColor(desaturatedColor, 0.2); //20% lighter
        
        //create subtle gradient
        const subtleGradient = `linear-gradient(135deg, ${desaturatedColor}40, ${lighterColor}30)`;
        
        console.log('applying subtle gradient:', subtleGradient);
        
        //create or update the background overlay
        this.createBackgroundOverlay(subtleGradient);
    }

    //desaturate a hex color by reducing saturation
    desaturateColor(hex, factor) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.s = hsl.s * factor; //reduce saturation
        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    //lighten a hex color
    lightenColor(hex, factor) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.l = Math.min(1, hsl.l + factor); //increase lightness
        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    //color conversion helper functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, l };
    }

    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    //create or update subtle full-screen background overlay
    createBackgroundOverlay(gradient) {
        let backgroundOverlay = document.getElementById('music-background-overlay');
        
        //create overlay if it doesn't exist
        if (!backgroundOverlay) {
            backgroundOverlay = document.createElement('div');
            backgroundOverlay.id = 'music-background-overlay';
            backgroundOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
                opacity: 0;
                transition: opacity 0.8s ease, background 0.8s ease;
                pointer-events: none;
            `;
            document.body.appendChild(backgroundOverlay);
        }
        
        //get current album image
        const albumImage = document.getElementById('album-image');
        const albumImageUrl = albumImage ? albumImage.src : '';
        
        //create very subtle layered background
        if (albumImageUrl) {
            backgroundOverlay.style.background = `
                ${gradient},
                linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.05)),
                url('${albumImageUrl}') center/cover no-repeat
            `;
            backgroundOverlay.style.backgroundBlendMode = 'normal, overlay, soft-light';
        } else {
            backgroundOverlay.style.background = gradient;
        }
        
        //show the overlay with reduced opacity
        backgroundOverlay.style.opacity = '0.4';
        
        //ensure all content sections stay above the background
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.position = 'relative';
            section.style.zIndex = '10';
        });
    }

    //reset body background to original color and remove overlay (don't touch navigation)
    resetBodyBackground() {
        console.log('resetting background');
        
        //hide and remove the background overlay
        const backgroundOverlay = document.getElementById('music-background-overlay');
        if (backgroundOverlay) {
            backgroundOverlay.style.opacity = '0';
            setTimeout(() => {
                if (backgroundOverlay.parentNode) {
                    backgroundOverlay.parentNode.removeChild(backgroundOverlay);
                }
            }, 800);
        }
        
        //reset sections z-index
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.position = '';
            section.style.zIndex = '';
        });
    }

    //create floating particles that move across screen using particle colors
    startParticleSystem() {
        const container = document.getElementById('music-particles');
        if (!container || !this.visualsActive) return;
        
        container.style.opacity = '1';
        
        const createParticle = () => {
            if (!this.visualsActive) return;
            
            const particle = document.createElement('div');
            particle.className = 'music-particle';
            
            //use particle colors instead of all colors
            const colors = this.particleColors;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            //style each particle with random size and color
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${randomColor};
                border-radius: 50%;
                left: ${Math.random() * 100}vw;
                top: 100vh;
                opacity: 0.8;
                animation: particleFloat ${Math.random() * 8 + 6}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
                z-index: 5;
            `;
            
            container.appendChild(particle);
            this.particles.push(particle);
            
            //cleanup particles after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                    this.particles = this.particles.filter(p => p !== particle);
                }
            }, 12000);
        };
        
        //create new particles every 300ms
        this.particleInterval = setInterval(createParticle, 300);
    }

    //create rhythm lines that sweep across screen using particle colors
    startRhythmLines() {
        const container = document.getElementById('rhythm-lines');
        if (!container || !this.visualsActive) return;
        
        container.style.opacity = '1';
        
        const createRhythmLine = () => {
            if (!this.visualsActive) return;
            
            const line = document.createElement('div');
            line.className = 'rhythm-line';
            
            //use particle colors instead of all colors
            const colors = this.particleColors;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            //style each rhythm line with gradient
            line.style.cssText = `
                position: absolute;
                height: 2px;
                width: 100px;
                background: linear-gradient(90deg, transparent, ${randomColor}, transparent);
                top: ${Math.random() * 100}vh;
                left: -200px;
                opacity: 0.7;
                animation: rhythmSweep ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 1}s;
                z-index: 5;
            `;
            
            container.appendChild(line);
            this.rhythmLines.push(line);
            
            //cleanup rhythm lines after animation
            setTimeout(() => {
                if (line.parentNode) {
                    line.parentNode.removeChild(line);
                    this.rhythmLines = this.rhythmLines.filter(l => l !== line);
                }
            }, 5000);
        };
        
        //create new rhythm lines every 1000ms
        this.rhythmInterval = setInterval(createRhythmLine, 1000);
    }

    //stop all visual effects and clean up DOM elements
    stopVisualEffects() {
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
        }
        if (this.rhythmInterval) {
            clearInterval(this.rhythmInterval);
        }
        
        const particleContainer = document.getElementById('music-particles');
        const rhythmContainer = document.getElementById('rhythm-lines');
        
        if (particleContainer) {
            particleContainer.style.opacity = '0';
        }
        if (rhythmContainer) {
            rhythmContainer.style.opacity = '0';
        }
        
        //remove all particles and lines from DOM
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.rhythmLines.forEach(line => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        });
        
        this.particles = [];
        this.rhythmLines = [];
        
        this.resetTheme();
    }

    //apply subtle dynamic theme colors to some page elements (not navigation)
    applyDynamicTheme() {
        if (!this.particleColors) return;
        
        const primaryColor = this.particleColors[0];
        const secondaryColor = this.particleColors[1] || primaryColor;
        
        //apply subtle theme to buttons only
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = `0 4px 15px ${primaryColor}15`;
            btn.style.border = `1px solid ${primaryColor}20`;
        });
        
        //apply very subtle theme to project cards
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = `${primaryColor}15`;
            card.style.boxShadow = `0 8px 25px ${primaryColor}10`;
        });
    }

    //reset all theme changes back to original (except navigation)
    resetTheme() {
        //reset buttons only
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = '';
            btn.style.border = '';
        });
        
        //reset project cards
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
            card.style.background = '';
        });
        
        const thoughtBubble = document.querySelector('.thought-bubble');
        if (thoughtBubble) {
            thoughtBubble.style.background = '';
            thoughtBubble.style.color = '';
            thoughtBubble.style.backdropFilter = '';
        }
    }
    
    //extract colors from album cover image
    extractColorsFromImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                try {
                    const colors = this.sampleImageColors(ctx, canvas.width, canvas.height);
                    console.log('extracted colors from image:', colors);
                    resolve(colors);
                } catch (error) {
                    console.log('color extraction failed, using fallback colors');
                    resolve(['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6']);
                }
            };
            
            img.onerror = () => {
                console.log('image load failed, using fallback colors');
                resolve(['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6']);
            };
            
            img.src = imageUrl;
        });
    }
    
    //sample colors from different parts of the image and separate into background vs particle colors
    sampleImageColors(ctx, width, height) {
        const allColors = [];
        const samplePoints = [
            { x: width * 0.25, y: height * 0.25 },
            { x: width * 0.75, y: height * 0.25 },
            { x: width * 0.5, y: height * 0.5 },
            { x: width * 0.25, y: height * 0.75 },
            { x: width * 0.75, y: height * 0.75 },
            { x: width * 0.1, y: height * 0.1 },
            { x: width * 0.9, y: height * 0.9 },
            { x: width * 0.1, y: height * 0.9 },
            { x: width * 0.9, y: height * 0.1 }
        ];
        
        samplePoints.forEach(point => {
            const imageData = ctx.getImageData(point.x, point.y, 1, 1);
            const [r, g, b] = imageData.data;
            
            const brightness = (r + g + b) / 3;
            if (brightness > 30 && brightness < 220) {
                //convert rgb to hex format for consistency
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                allColors.push(hex);
            }
        });
        
        //get unique colors
        const uniqueColors = [...new Set(allColors)];
        
        if (uniqueColors.length > 0) {
            //use first color as background (usually dominant), rest as particles
            this.backgroundColors = [uniqueColors[0]];
            this.particleColors = uniqueColors.slice(1);
            
            //ensure we have at least some particle colors
            if (this.particleColors.length === 0) {
                this.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
            }
            
            //combine for backward compatibility
            return uniqueColors;
        } else {
            //use fallback colors
            this.backgroundColors = ['#ff6b6b'];
            this.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
            return ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        }
    }
    
    //start checking for current track data
    startMusicDisplay() {
        this.checkThomasCurrentTrack();
        this.updateInterval = setInterval(() => this.checkThomasCurrentTrack(), 30000);
    }
    
    //check spotify api for current track
    async checkThomasCurrentTrack() {
        try {
            const response = await fetch(`${this.baseUrl}?action=current-track`);
            const data = await response.json();
            
            if (data.needsAuth) {
                this.showOfflineState();
                this.addOwnerAuthButton();
                return;
            }
            
            if (data.track) {
                //extract colors from album cover when track data is available
                if (data.track.image) {
                    this.currentColors = await this.extractColorsFromImage(data.track.image);
                }
                
                if (data.isPlaying) {
                    this.displayCurrentTrack(data);
                } else {
                    this.displayPausedTrack(data);
                }
            } else {
                this.showNotListening();
            }
            
        } catch (error) {
            console.log('api error:', error);
            this.showOfflineState();
        }
    }
    
    //display currently playing track
    displayCurrentTrack(data) {
        const track = data.track;
        const isPlaying = data.isPlaying;
        
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = 'Thomas is currently listening to...';
        }
        
        this.updateTrackDisplay(track, isPlaying);
        this.showSpotifyContent();
    }
    
    //display paused track
    displayPausedTrack(data) {
        const track = data.track;
        
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = 'Thomas paused his music...';
        }
        
        this.updateTrackDisplay(track, false);
        this.showSpotifyContent();
    }
    
    //show when not listening to music
    showNotListening() {
        const elements = {
            content: document.getElementById('spotify-content'),
            loading: document.querySelector('.spotify-loading'),
            offline: document.getElementById('spotify-offline')
        };
        
        if (elements.content) elements.content.style.display = 'none';
        if (elements.loading) elements.loading.style.display = 'flex';
        if (elements.offline) elements.offline.style.display = 'none';
        
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = 'Thomas isn\'t listening to anything right now...';
        }
    }
    
    //update track display with current song info and refresh background if album changed
    updateTrackDisplay(track, isPlaying = false) {
        const elements = {
            title: document.getElementById('song-title'),
            artist: document.getElementById('artist-name'),
            album: document.getElementById('album-name'),
            image: document.getElementById('album-image'),
            vinyl: document.querySelector('.vinyl-overlay'),
            status: document.querySelector('.song-status'),
            waves: document.querySelectorAll('.music-wave')
        };
        
        if (elements.title) elements.title.textContent = track.name;
        if (elements.artist) elements.artist.textContent = track.artists.join(', ');
        if (elements.album) elements.album.textContent = track.album;
        if (elements.image) {
            elements.image.src = track.image || '';
            elements.image.alt = `${track.album} by ${track.artists[0]}`;
        }
        
        //check if album image changed and refresh background colors
        if (track.image && track.image !== this.currentAlbumImage) {
            console.log('album image changed, refreshing background colors');
            this.currentAlbumImage = track.image;
            this.refreshBackgroundFromNewAlbum(track.image);
        }
        
        //update status text with music waves
        if (elements.status) {
            elements.status.innerHTML = `
                Thomas is currently ${isPlaying ? 'listening to' : 'paused on'}...
                <div class="music-waves">
                    <div class="music-wave ${isPlaying ? 'playing' : ''}"></div>
                    <div class="music-wave ${isPlaying ? 'playing' : ''}"></div>
                    <div class="music-wave ${isPlaying ? 'playing' : ''}"></div>
                    <div class="music-wave ${isPlaying ? 'playing' : ''}"></div>
                    <div class="music-wave ${isPlaying ? 'playing' : ''}"></div>
                </div>
            `;
        }
        
        //control vinyl animation
        if (elements.vinyl) {
            elements.vinyl.classList.remove('playing', 'paused');
            elements.vinyl.classList.add(isPlaying ? 'playing' : 'paused');
        }
    }

    //refresh background colors when album changes
    async refreshBackgroundFromNewAlbum(imageUrl) {
        try {
            const newColors = await this.extractColorsFromImage(imageUrl);
            console.log('extracted new colors from album:', newColors);
            
            //update the background if visuals are currently active
            if (this.visualsActive) {
                setTimeout(() => {
                    this.changeBodyBackground();
                }, 200); //small delay to ensure image is loaded
            }
        } catch (error) {
            console.log('failed to extract colors from new album:', error);
        }
    }

    //show spotify content panel
    showSpotifyContent() {
        const elements = {
            content: document.getElementById('spotify-content'),
            loading: document.querySelector('.spotify-loading'),
            offline: document.getElementById('spotify-offline')
        };
        
        if (elements.content) elements.content.style.display = 'flex';
        if (elements.loading) elements.loading.style.display = 'none';
        if (elements.offline) elements.offline.style.display = 'none';
    }
    
    //show offline state when no connection
    showOfflineState() {
        const elements = {
            content: document.getElementById('spotify-content'),
            loading: document.querySelector('.spotify-loading'),
            offline: document.getElementById('spotify-offline')
        };
        
        if (elements.content) elements.content.style.display = 'none';
        if (elements.loading) elements.loading.style.display = 'flex';
        if (elements.offline) elements.offline.style.display = 'block';
        
        const offlineText = document.querySelector('.offline-text');
        const lastPlayed = document.querySelector('.last-played');
        if (offlineText) offlineText.textContent = 'Thomas is offline!';
        if (lastPlayed) lastPlayed.textContent = "He must be doing something important...";
    }
    
    //handle spotify authentication
    async authenticateOwner() {
        try {
            const response = await fetch(`${this.baseUrl}?action=auth`);
            const data = await response.json();
            
            if (data.authUrl) {
                window.location.href = data.authUrl;
            }
        } catch (error) {
            console.error('authentication failed:', error);
        }
    }
    
    //add authentication button for owner
    addOwnerAuthButton() {
        if (!document.querySelector('.owner-auth-btn')) {
            const authButton = document.createElement('button');
            authButton.className = 'owner-auth-btn';
            authButton.textContent = 'Setup Thomas\'s Spotify (One Time)';
            authButton.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                padding: 12px 24px;
                background: #1DB954;
                color: white;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
                transition: all 0.3s ease;
                font-size: 14px;
            `;
            
            authButton.onclick = () => this.authenticateOwner();
            document.body.appendChild(authButton);
        }
    }
    
    //remove authentication button
    clearButton() {
        const authButton = document.querySelector('.owner-auth-btn');
        if (authButton) authButton.remove();
    }
}

//initialize when DOM is loaded
let thomasSpotifyPlayer;

document.addEventListener('DOMContentLoaded', function() {
    thomasSpotifyPlayer = new ServerlessSpotifyIntegration();
});

//enhanced debug tools with visual testing
window.spotifyDebug = {
    checkNow: () => {
        thomasSpotifyPlayer?.checkThomasCurrentTrack();
    },
    
    testAuth: () => {
        thomasSpotifyPlayer?.authenticateOwner();
    },
    
    testVisuals: () => {
        //force some test colors and activate visuals
        if (thomasSpotifyPlayer) {
            thomasSpotifyPlayer.backgroundColors = ['#ff6b6b'];
            thomasSpotifyPlayer.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12'];
            thomasSpotifyPlayer.cancelDeactivation(); 
            thomasSpotifyPlayer.activateVisuals();
            console.log('visual effects activated with test colors!');
        }
    },
    
    testColorsFromCurrentSong: () => {
        if (thomasSpotifyPlayer && thomasSpotifyPlayer.backgroundColors) {
            console.log('current background colors:', thomasSpotifyPlayer.backgroundColors);
            console.log('current particle colors:', thomasSpotifyPlayer.particleColors);
            thomasSpotifyPlayer.cancelDeactivation();
            thomasSpotifyPlayer.activateVisuals();
        } else {
            console.log('no colors extracted yet - make sure you have a song playing');
        }
    },
    
    stopVisuals: () => {
        if (thomasSpotifyPlayer) {
            thomasSpotifyPlayer.cancelDeactivation(); //cancel delay
            thomasSpotifyPlayer.visualsActive = false;
            thomasSpotifyPlayer.stopVisualEffects();
            thomasSpotifyPlayer.resetBodyBackground();
            console.log('visual effects stopped immediately');
        }
    },
    
    testBackgroundRefresh: () => {
        if (thomasSpotifyPlayer) {
            console.log('testing background refresh...');
            thomasSpotifyPlayer.refreshBackgroundFromNewAlbum('https://example.com/test-image.jpg');
        }
    }
};