//enhanced spotify.js for serverless backend in Spotify_Integration/spotify.js
class ServerlessSpotifyIntegration {
    constructor() {
        this.baseUrl = '/.netlify/functions/spotify';
        this.currentColors = null;
        this.visualsActive = false;
        this.particles = [];
        this.rhythmLines = [];
        this.initializeDisplay();
        this.setupVisualEffects();
    }
    
    initializeDisplay() {
        this.startMusicDisplay();
    }
    
    //setup all the visual effect containers and listeners
    setupVisualEffects() {
        this.createVisualContainers();
        this.setupHoverEffects();
    }
    
    //create all the DOM elements we need for the visual effects
    createVisualContainers() {
        //create particle container directly on body
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
            z-index: 1;
            opacity: 0;
            transition: opacity 0.8s ease;
        `;
        document.body.appendChild(particleContainer);
        
        //create rhythm lines container directly on body
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
            z-index: 1;
            opacity: 0;
            transition: opacity 0.8s ease;
        `;
        document.body.appendChild(rhythmContainer);
    }
        
    //setup hover listeners for profile picture to trigger visual effects
    setupHoverEffects() {
        const profileContainer = document.querySelector('.section__pic-container.spotify-enhanced');
        
        if (profileContainer) {
            profileContainer.addEventListener('mouseenter', () => {
                this.activateVisuals();
            });
            
            profileContainer.addEventListener('mouseleave', () => {
                this.deactivateVisuals();
            });
        }
    }
    
    //turn on all the visual effects when hovering over profile
    activateVisuals() {
        if (!this.currentColors) return;
        
        this.visualsActive = true;
        this.startParticleSystem();
        this.startRhythmLines();
        this.changeBodyBackground();
        this.applyDynamicTheme();
    }

    //turn off all visual effects when not hovering
    deactivateVisuals() {
        this.visualsActive = false;
        this.stopVisualEffects();
        this.resetBodyBackground();
    }
    //reset body background to original
    resetBodyBackground() {
        //reset to original background color from your style.css
        document.body.style.background = '#eef2f4';
        document.body.style.transition = 'background 0.8s ease';
    }

    //create floating particles that drift across the screen
    startParticleSystem() {
        const container = document.getElementById('music-particles');
        if (!container || !this.visualsActive) return;
        
        //show particle container
        container.style.opacity = '1';
        
        const createParticle = () => {
            if (!this.visualsActive) return;
            
            const particle = document.createElement('div');
            particle.className = 'music-particle';
            
            //use album colors for particles
            const colors = this.currentColors;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            //particle styling
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
            `;
            
            container.appendChild(particle);
            this.particles.push(particle);
            
            //remove particle after animation completes
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                    this.particles = this.particles.filter(p => p !== particle);
                }
            }, 12000);
        };
        
        //create particles at regular intervals
        this.particleInterval = setInterval(createParticle, 200);
    }

    //create rhythm lines that sweep across the screen
    startRhythmLines() {
        const container = document.getElementById('rhythm-lines');
        if (!container || !this.visualsActive) return;
        
        //show rhythm container
        container.style.opacity = '1';
        
        const createRhythmLine = () => {
            if (!this.visualsActive) return;
            
            const line = document.createElement('div');
            line.className = 'rhythm-line';
            
            //use album colors for rhythm lines
            const colors = this.currentColors;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            //rhythm line styling
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
            `;
            
            container.appendChild(line);
            this.rhythmLines.push(line);
            
            //remove line after animation
            setTimeout(() => {
                if (line.parentNode) {
                    line.parentNode.removeChild(line);
                    this.rhythmLines = this.rhythmLines.filter(l => l !== line);
                }
            }, 5000);
        };
        
        //create rhythm lines at intervals
        this.rhythmInterval = setInterval(createRhythmLine, 800);
    }

    //stop all visual effects and clean up
    stopVisualEffects() {
        //clear all intervals
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
        }
        if (this.rhythmInterval) {
            clearInterval(this.rhythmInterval);
        }
        
        //hide containers
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
        
        //reset all theme changes
        this.resetTheme();
    }

    //create pulsing background gradients using album colors
    startPulseBackground() {
        const container = document.getElementById('pulse-background');
        if (!container || !this.visualsActive) return;
        
        const colors = this.currentColors;
        const primaryColor = colors[0];
        const secondaryColor = colors[1] || colors[0];
        const tertiaryColor = colors[2] || colors[1] || colors[0];
        
        //create beautiful, bright gradient backgrounds that enhance rather than darken
        const gradients = [
            `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}15 50%, ${tertiaryColor}10 100%)`,
            `radial-gradient(circle at 30% 70%, ${primaryColor}15 0%, transparent 50%), 
            radial-gradient(circle at 70% 30%, ${secondaryColor}15 0%, transparent 50%),
            linear-gradient(45deg, ${tertiaryColor}08 0%, ${primaryColor}12 100%)`,
            `conic-gradient(from 45deg, ${primaryColor}12, ${secondaryColor}15, ${tertiaryColor}10, ${primaryColor}12)`
        ];
        
        //randomly select a gradient style
        const selectedGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        //blend with the original background instead of replacing it
        container.style.background = `
            ${selectedGradient},
            linear-gradient(135deg, #f7faec 0%, #e8f4f8 50%, #f0f8ff 100%)
        `;
        
        container.classList.add('pulsing');
        
        //add some sparkle effects
        this.addSparkleOverlay();
    }
    
    //apply dynamic theme colors to page elements with more subtle effects
    applyDynamicTheme() {
        if (!this.currentColors) return;
        
        const primaryColor = this.currentColors[0];
        const secondaryColor = this.currentColors[1] || primaryColor;
        
        //apply subtle color theme to navigation
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.background = `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08)`;
            nav.style.backdropFilter = 'blur(20px)';
            nav.style.borderBottom = `1px solid ${primaryColor}20`;
        }
        
        //apply subtle glow to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = `0 4px 15px ${primaryColor}25`;
            btn.style.border = `1px solid ${primaryColor}30`;
        });
        
        //apply theme to project cards with subtle colors
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = `${primaryColor}25`;
            card.style.boxShadow = `0 8px 25px ${primaryColor}15`;
            card.style.background = `linear-gradient(135deg, ${primaryColor}02, ${secondaryColor}02)`;
        });
        
        //apply theme to thought bubble
        const thoughtBubble = document.querySelector('.thought-bubble');
        if (thoughtBubble) {
            thoughtBubble.style.background = `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`;
            thoughtBubble.style.color = this.getContrastColor(primaryColor);
            thoughtBubble.style.backdropFilter = 'blur(10px)';
        }
    }

    //helper function to get contrasting text color
    getContrastColor(hexColor) {
        //convert hex to rgb
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        //calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#333333' : '#ffffff';
    }

    //add sparkle overlay for extra visual appeal
    addSparkleOverlay() {
        const overlay = document.getElementById('music-visual-overlay');
        if (!overlay) return;
        
        //create sparkle container if it doesn't exist
        let sparkleContainer = document.getElementById('sparkle-container');
        if (!sparkleContainer) {
            sparkleContainer = document.createElement('div');
            sparkleContainer.id = 'sparkle-container';
            sparkleContainer.className = 'sparkle-container';
            overlay.appendChild(sparkleContainer);
        }
        
        //create sparkles
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createSparkle(sparkleContainer);
            }, i * 200);
        }
    }

    //create individual sparkle effects
    createSparkle(container) {
        if (!this.visualsActive) return;
        
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        //random position and size
        sparkle.style.left = Math.random() * 100 + 'vw';
        sparkle.style.top = Math.random() * 100 + 'vh';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        
        //use album colors for sparkles
        const colors = this.currentColors;
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.background = randomColor;
        
        container.appendChild(sparkle);
        
        //remove sparkle after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 4000);
    }
    
    //reset all theme changes back to original
    resetTheme() {
        //reset navigation
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.background = '';
            nav.style.backdropFilter = '';
            nav.style.borderBottom = '';
        }
        
        //reset buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = '';
            btn.style.border = '';
        });
        
        //reset project cards
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = '';
            btn.style.boxShadow = '';
            card.style.background = '';
        });
        
        //reset thought bubble
        const thoughtBubble = document.querySelector('.thought-bubble');
        if (thoughtBubble) {
            thoughtBubble.style.background = '';
            thoughtBubble.style.color = '';
            thoughtBubble.style.backdropFilter = '';
        }
        
        //remove sparkle container
        const sparkleContainer = document.getElementById('sparkle-container');
        if (sparkleContainer) {
            sparkleContainer.remove();
        }
    }
    
    //extract dominant colors from album cover image
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
                    //sample colors from different parts of the image
                    const colors = this.sampleImageColors(ctx, canvas.width, canvas.height);
                    resolve(colors);
                } catch (error) {
                    //fallback colors if extraction fails
                    resolve(['#1DB954', '#1ed760', '#11a63a']);
                }
            };
            
            img.onerror = () => {
                //fallback colors if image fails to load
                resolve(['#1DB954', '#1ed760', '#11a63a']);
            };
            
            img.src = imageUrl;
        });
    }
    
    //sample colors from different parts of the image
    sampleImageColors(ctx, width, height) {
        const colors = [];
        const samplePoints = [
            { x: width * 0.25, y: height * 0.25 },
            { x: width * 0.75, y: height * 0.25 },
            { x: width * 0.5, y: height * 0.5 },
            { x: width * 0.25, y: height * 0.75 },
            { x: width * 0.75, y: height * 0.75 }
        ];
        
        samplePoints.forEach(point => {
            const imageData = ctx.getImageData(point.x, point.y, 1, 1);
            const [r, g, b] = imageData.data;
            
            //only add colors that aren't too dark or too light
            const brightness = (r + g + b) / 3;
            if (brightness > 50 && brightness < 200) {
                colors.push(`rgb(${r}, ${g}, ${b})`);
            }
        });
        
        //return unique colors or fallback
        return colors.length > 0 ? [...new Set(colors)] : ['#1DB954', '#1ed760', '#11a63a'];
    }
    
    startMusicDisplay() {
        this.checkThomasCurrentTrack();
        //check music every 30 seconds
        this.updateInterval = setInterval(() => this.checkThomasCurrentTrack(), 30000);
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
            console.log('API error:', error);
            this.showOfflineState();
        }
    }
    
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
    
    displayPausedTrack(data) {
        const track = data.track;
        
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = 'Thomas paused his music...';
        }
        
        this.updateTrackDisplay(track, false);
        this.showSpotifyContent();
    }
    
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
        if (lastPlayed) lastPlayed.textContent = 'Authentication needed...';
    }
    
    async authenticateOwner() {
        try {
            const response = await fetch(`${this.baseUrl}?action=auth`);
            const data = await response.json();
            
            if (data.authUrl) {
                window.location.href = data.authUrl;
            }
        } catch (error) {
            console.error('Authentication failed:', error);
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

//initialize when DOM is loaded
let thomasSpotifyPlayer;

document.addEventListener('DOMContentLoaded', function() {
    thomasSpotifyPlayer = new ServerlessSpotifyIntegration();
});

//debug tools
window.spotifyDebug = {
    checkNow: () => {
        thomasSpotifyPlayer?.checkThomasCurrentTrack();
    },
    
    testAuth: () => {
        thomasSpotifyPlayer?.authenticateOwner();
    },
    
    testVisuals: () => {
        thomasSpotifyPlayer?.activateVisuals();
    }
};

//debug addition - add this to the end of your existing spotify.js file

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
            thomasSpotifyPlayer.currentColors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
            thomasSpotifyPlayer.activateVisuals();
            console.log('Visual effects activated with test colors!');
        }
    },
    
    testColorsFromCurrentSong: () => {
        if (thomasSpotifyPlayer && thomasSpotifyPlayer.currentColors) {
            console.log('Current extracted colors:', thomasSpotifyPlayer.currentColors);
            thomasSpotifyPlayer.activateVisuals();
        } else {
            console.log('No colors extracted yet - make sure you have a song playing');
        }
    },
    
    stopVisuals: () => {
        if (thomasSpotifyPlayer) {
            thomasSpotifyPlayer.deactivateVisuals();
            console.log('Visual effects stopped');
        }
    }
};