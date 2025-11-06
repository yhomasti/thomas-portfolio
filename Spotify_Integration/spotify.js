//updated spotify.js with progress bar and instant updates
class ServerlessSpotifyIntegration {
    constructor() {
        this.baseUrl = '/.netlify/functions/spotify';
        this.currentColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        this.backgroundColors = ['#ff6b6b'];
        this.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        this.visualsActive = false;
        this.particles = [];
        this.rhythmLines = [];
        this.currentAlbumImage = null;
        this.fadeTimeout = null;
        this.hoverTimeout = null;
        this.initializeDisplay();
        this.setupVisualEffects();
    }
    
    initializeDisplay() {
        this.startMusicDisplay();
    }
    
    setupVisualEffects() {
        this.createVisualContainers();
        this.setupHoverEffects();
    }
    
    createVisualContainers() {
        const existingParticles = document.getElementById('music-particles');
        const existingRhythm = document.getElementById('rhythm-lines');
        if (existingParticles) existingParticles.remove();
        if (existingRhythm) existingRhythm.remove();
        
        const particleContainer = document.createElement('div');
        particleContainer.id = 'music-particles';
        particleContainer.className = 'music-particle-container';
        particleContainer.style.cssText = `
            position: fixed !important;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1001 !important;
            opacity: 0;
            transition: opacity 0.8s ease;
            overflow: hidden;
        `;
        document.body.appendChild(particleContainer);
        
        const rhythmContainer = document.createElement('div');
        rhythmContainer.id = 'rhythm-lines';
        rhythmContainer.className = 'rhythm-lines-container';
        rhythmContainer.style.cssText = `
            position: fixed !important;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1001 !important;
            opacity: 0;
            transition: opacity 0.8s ease;
            overflow: hidden;
        `;
        document.body.appendChild(rhythmContainer);
    }
        
    setupHoverEffects() {
        const profileContainer = document.querySelector('.section__pic-container.spotify-enhanced');
        const spotifyTooltip = document.querySelector('.spotify-tooltip');
        
        if (profileContainer) {
            profileContainer.addEventListener('mouseenter', () => {
                if (this.hoverTimeout) {
                    clearTimeout(this.hoverTimeout);
                }
                
                this.hoverTimeout = setTimeout(() => {
                    this.cancelDeactivation();
                    this.activateVisuals();
                }, 100);
            });
            
            profileContainer.addEventListener('mouseleave', () => {
                if (this.hoverTimeout) {
                    clearTimeout(this.hoverTimeout);
                }
                this.deactivateVisuals();
            });
        }
        
        if (spotifyTooltip) {
            spotifyTooltip.addEventListener('mouseenter', () => {
                this.cancelDeactivation();
            });
            
            spotifyTooltip.addEventListener('mouseleave', () => {
                this.deactivateVisuals();
            });
        }
    }
    
    activateVisuals() {
        if (!this.backgroundColors || this.backgroundColors.length === 0) {
            this.backgroundColors = ['#ff6b6b'];
        }
        if (!this.particleColors || this.particleColors.length === 0) {
            this.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        }
        
        this.visualsActive = true;
        this.startParticleSystem();
        this.startRhythmLines();
        this.applyDynamicTheme();
    }

    deactivateVisuals() {
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
        }
        
        this.fadeTimeout = setTimeout(() => {
            this.visualsActive = false;
            this.stopVisualEffects();
            this.resetBodyBackground();
            this.fadeTimeout = null;
        }, 2500);
    }

    cancelDeactivation() {
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
    }

    changeBodyBackground() {
        const primaryColor = this.backgroundColors[0];
        const desaturatedColor = this.desaturateColor(primaryColor, 0.3);
        const lighterColor = this.lightenColor(desaturatedColor, 0.2);
        const subtleGradient = `linear-gradient(135deg, ${desaturatedColor}40, ${lighterColor}30)`;
        
        this.createBackgroundOverlay(subtleGradient);
    }

    desaturateColor(hex, factor) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.s = hsl.s * factor;
        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    lightenColor(hex, factor) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.l = Math.min(1, hsl.l + factor);
        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

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

    createBackgroundOverlay(gradient) {
        let backgroundOverlay = document.getElementById('music-background-overlay');
        
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
        
        const albumImage = document.getElementById('album-image');
        const albumImageUrl = albumImage ? albumImage.src : '';
        
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
        
        backgroundOverlay.style.opacity = '0.4';
        
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.position = 'relative';
            section.style.zIndex = '10';
        });
    }

    resetBodyBackground() {
        const backgroundOverlay = document.getElementById('music-background-overlay');
        if (backgroundOverlay) {
            backgroundOverlay.style.opacity = '0';
            setTimeout(() => {
                if (backgroundOverlay.parentNode) {
                    backgroundOverlay.parentNode.removeChild(backgroundOverlay);
                }
            }, 800);
        }
        
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.position = '';
            section.style.zIndex = '';
        });
    }

    startParticleSystem() {
        const container = document.getElementById('music-particles');
        if (!container || !this.visualsActive) return;
        
        container.style.opacity = '1';
        
        const createParticle = () => {
            if (!this.visualsActive || this.particles.length >= 30) return;
            
            const particle = document.createElement('div');
            particle.className = 'music-particle';
            
            const colors = this.particleColors && this.particleColors.length > 0 
                ? this.particleColors 
                : ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
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
                z-index: 1001 !important;
                pointer-events: none;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            `;
            
            container.appendChild(particle);
            this.particles.push(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                    this.particles = this.particles.filter(p => p !== particle);
                }
            }, 12000);
        };
        
        createParticle();
        setTimeout(createParticle, 200);
        setTimeout(createParticle, 400);
        
        setTimeout(() => {
            this.particleInterval = setInterval(createParticle, 400);
        }, 600);
    }

    startRhythmLines() {
        const container = document.getElementById('rhythm-lines');
        if (!container || !this.visualsActive) return;
        
        container.style.opacity = '1';
        
        const createRhythmLine = () => {
            if (!this.visualsActive || this.rhythmLines.length >= 30) return;
            
            const line = document.createElement('div');
            line.className = 'rhythm-line';
            
            const colors = this.particleColors;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
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
                z-index: 1001;
            `;
            
            container.appendChild(line);
            this.rhythmLines.push(line);
            
            setTimeout(() => {
                if (line.parentNode) {
                    line.parentNode.removeChild(line);
                    this.rhythmLines = this.rhythmLines.filter(l => l !== line);
                }
            }, 5000);
        };
        
        this.rhythmInterval = setInterval(createRhythmLine, 1000);
    }

    stopVisualEffects() {
        if (this.particleInterval) clearInterval(this.particleInterval);
        if (this.rhythmInterval) clearInterval(this.rhythmInterval);
        
        const particleContainer = document.getElementById('music-particles');
        const rhythmContainer = document.getElementById('rhythm-lines');
        
        if (particleContainer) particleContainer.style.opacity = '0';
        if (rhythmContainer) rhythmContainer.style.opacity = '0';
        
        this.particles.forEach(particle => {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        });
        this.rhythmLines.forEach(line => {
            if (line.parentNode) line.parentNode.removeChild(line);
        });
        
        this.particles = [];
        this.rhythmLines = [];
        this.resetTheme();
    }

    applyDynamicTheme() {
        if (!this.particleColors) return;
        
        const primaryColor = this.particleColors[0];
        
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = `0 4px 15px ${primaryColor}15`;
            btn.style.border = `1px solid ${primaryColor}20`;
        });
        
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = `${primaryColor}15`;
            card.style.boxShadow = `0 8px 25px ${primaryColor}10`;
        });
    }

    resetTheme() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = '';
            btn.style.border = '';
        });
        
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
            card.style.background = '';
        });
    }
    
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
                    resolve(colors);
                } catch (error) {
                    resolve(['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6']);
                }
            };
            
            img.onerror = () => {
                resolve(['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6']);
            };
            
            img.src = imageUrl;
        });
    }
    
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
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                allColors.push(hex);
            }
        });
        
        const uniqueColors = [...new Set(allColors)];
        
        if (uniqueColors.length > 0) {
            this.backgroundColors = [uniqueColors[0]];
            this.particleColors = uniqueColors.slice(1);
            
            if (this.particleColors.length === 0) {
                this.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
            }
            
            return uniqueColors;
        } else {
            this.backgroundColors = ['#ff6b6b'];
            this.particleColors = ['#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
            return ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        }
    }
    
    //format milliseconds to MM:SS
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    startMusicDisplay() {
        this.checkThomasCurrentTrack();
        //check every 5 seconds for near-instant updates
        this.updateInterval = setInterval(() => this.checkThomasCurrentTrack(), 5000);
    }
    
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
                if (data.track.image && data.track.image !== this.currentAlbumImage) {
                    this.currentAlbumImage = data.track.image;
                    await this.extractColorsFromImage(data.track.image);
                }
                
                if (data.isPlaying) {
                    this.displayCurrentTrack(data);
                } else {
                    this.displayPausedTrack(data);
                }
            } else {
                this.showOfflineState();
            }
            
        } catch (error) {
            console.log('api error:', error);
            this.showOfflineState();
        }
    }
    
    displayCurrentTrack(data) {
        const track = data.track;
        const isPlaying = data.isPlaying;
        const progress = data.progress_ms || 0;
        
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = 'Thomas is currently listening to...';
        }
        
        this.updateTrackDisplay(track, isPlaying, progress);
        this.showSpotifyContent();
    }
    
    displayPausedTrack(data) {
        const track = data.track;
        const progress = data.progress_ms || 0;
        
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = 'Thomas paused his music...';
        }
        
        this.updateTrackDisplay(track, false, progress);
        this.showSpotifyContent();
    }
    
    async updateTrackDisplay(track, isPlaying = false, progress_ms = 0) {
        const elements = {
            title: document.getElementById('song-title'),
            artist: document.getElementById('artist-name'),
            album: document.getElementById('album-name'),
            image: document.getElementById('album-image'),
            vinyl: document.querySelector('.vinyl-overlay'),
            status: document.querySelector('.song-status'),
            progressContainer: document.getElementById('song-progress-container'),
            progressFill: document.getElementById('song-progress-fill'),
            currentTime: document.getElementById('current-time'),
            totalTime: document.getElementById('total-time')
        };
        
        if (elements.title) elements.title.textContent = track.name;
        if (elements.artist) elements.artist.textContent = track.artists.join(', ');
        if (elements.album) elements.album.textContent = track.album;
        if (elements.image) {
            elements.image.src = track.image || '';
            elements.image.alt = `${track.album} by ${track.artists[0]}`;
        }
        
        //update progress bar
        if (track.duration_ms && elements.progressContainer) {
            elements.progressContainer.style.display = 'block';
            
            const progressPercent = (progress_ms / track.duration_ms) * 100;
            if (elements.progressFill) {
                elements.progressFill.style.width = progressPercent + '%';
            }
            
            if (elements.currentTime) {
                elements.currentTime.textContent = this.formatTime(progress_ms);
            }
            if (elements.totalTime) {
                elements.totalTime.textContent = this.formatTime(track.duration_ms);
            }
        }
        
        //update status with music waves
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
        
        if (elements.vinyl) {
            elements.vinyl.classList.remove('playing', 'paused');
            elements.vinyl.classList.add(isPlaying ? 'playing' : 'paused');
        }
    }

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
    
    clearButton() {
        const authButton = document.querySelector('.owner-auth-btn');
        if (authButton) authButton.remove();
    }
}

let thomasSpotifyPlayer;

document.addEventListener('DOMContentLoaded', function() {
    thomasSpotifyPlayer = new ServerlessSpotifyIntegration();
});

window.spotifyDebug = {
    checkNow: () => {
        thomasSpotifyPlayer?.checkThomasCurrentTrack();
    },
    
    testAuth: () => {
        thomasSpotifyPlayer?.authenticateOwner();
    },
    
    testVisuals: () => {
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
            thomasSpotifyPlayer.cancelDeactivation();
            thomasSpotifyPlayer.visualsActive = false;
            thomasSpotifyPlayer.stopVisualEffects();
            thomasSpotifyPlayer.resetBodyBackground();
            console.log('visual effects stopped immediately');
        }
    }
};