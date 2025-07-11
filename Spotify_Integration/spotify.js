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
        //main visual overlay that contains everything
        const visualOverlay = document.createElement('div');
        visualOverlay.id = 'music-visual-overlay';
        visualOverlay.className = 'music-visual-overlay';
        document.body.appendChild(visualOverlay);
        
        //container for floating particles
        const particleContainer = document.createElement('div');
        particleContainer.id = 'music-particles';
        particleContainer.className = 'music-particle-container';
        visualOverlay.appendChild(particleContainer);
        
        //container for rhythm lines that sweep across screen
        const rhythmContainer = document.createElement('div');
        rhythmContainer.id = 'rhythm-lines';
        rhythmContainer.className = 'rhythm-lines-container';
        visualOverlay.appendChild(rhythmContainer);
        
        //pulsing background gradients
        const pulseContainer = document.createElement('div');
        pulseContainer.id = 'pulse-background';
        pulseContainer.className = 'pulse-background';
        visualOverlay.appendChild(pulseContainer);
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
        const overlay = document.getElementById('music-visual-overlay');
        
        if (overlay) {
            overlay.classList.add('active');
            this.startParticleSystem();
            this.startRhythmLines();
            this.startPulseBackground();
            this.applyDynamicTheme();
        }
    }
    
    //turn off all visual effects when not hovering
    deactivateVisuals() {
        this.visualsActive = false;
        const overlay = document.getElementById('music-visual-overlay');
        
        if (overlay) {
            overlay.classList.remove('active');
            this.stopVisualEffects();
        }
    }
    
    //create floating particles that drift across the screen
    startParticleSystem() {
        const container = document.getElementById('music-particles');
        if (!container || !this.visualsActive) return;
        
        const createParticle = () => {
            if (!this.visualsActive) return;
            
            const particle = document.createElement('div');
            particle.className = 'music-particle';
            
            //use album colors for particles
            const colors = this.currentColors;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.background = `radial-gradient(circle, ${randomColor}, transparent)`;
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
            
            //random size and opacity
            const size = Math.random() * 12 + 4;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.opacity = Math.random() * 0.8 + 0.2;
            
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
        this.particleInterval = setInterval(createParticle, 150);
    }
    
    //create rhythm lines that sweep across the screen
    startRhythmLines() {
        const container = document.getElementById('rhythm-lines');
        if (!container || !this.visualsActive) return;
        
        const createRhythmLine = () => {
            if (!this.visualsActive) return;
            
            const line = document.createElement('div');
            line.className = 'rhythm-line';
            
            //use album colors for rhythm lines
            const colors = this.currentColors;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            line.style.background = `linear-gradient(90deg, transparent, ${randomColor}, transparent)`;
            line.style.top = Math.random() * 100 + 'vh';
            line.style.animationDelay = Math.random() * 1 + 's';
            line.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
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
    
    //create pulsing background gradients using album colors
    startPulseBackground() {
        const container = document.getElementById('pulse-background');
        if (!container || !this.visualsActive) return;
        
        const colors = this.currentColors;
        const primaryColor = colors[0];
        const secondaryColor = colors[1] || colors[0];
        
        //create multiple radial gradients for depth
        container.style.background = `
            radial-gradient(circle at 20% 20%, ${primaryColor}15 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${secondaryColor}15 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, ${primaryColor}10 0%, transparent 50%)
        `;
        
        container.classList.add('pulsing');
    }
    
    //apply dynamic theme colors to page elements
    applyDynamicTheme() {
        if (!this.currentColors) return;
        
        const primaryColor = this.currentColors[0];
        const secondaryColor = this.currentColors[1] || primaryColor;
        
        //apply to navigation bar
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.background = `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`;
            nav.style.backdropFilter = 'blur(15px)';
        }
        
        //apply glow to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = `0 4px 20px ${primaryColor}30`;
        });
        
        //apply theme to project cards
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = `${primaryColor}40`;
            card.style.boxShadow = `0 4px 15px ${primaryColor}20`;
        });
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
        
        //reset pulsing background
        const pulseContainer = document.getElementById('pulse-background');
        if (pulseContainer) {
            pulseContainer.classList.remove('pulsing');
        }
        
        //reset all theme changes
        this.resetTheme();
    }
    
    //reset all theme changes back to original
    resetTheme() {
        //reset navigation
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.background = '';
            nav.style.backdropFilter = '';
        }
        
        //reset buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = '';
        });
        
        //reset project cards
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
        });
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