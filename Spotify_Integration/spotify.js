//updated spotify.js with proper background color changing
class ServerlessSpotifyIntegration {
    constructor() {
        this.baseUrl = '/.netlify/functions/spotify';
        //set fallback colors to ensure visuals always work
        this.currentColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        this.visualsActive = false;
        this.particles = [];
        this.rhythmLines = [];
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
    
    //create particle and rhythm line containers in the DOM
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
            z-index: 1;
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
            z-index: 1;
            opacity: 0;
            transition: opacity 0.8s ease;
        `;
        document.body.appendChild(rhythmContainer);
    }
        
    //add hover event listeners to profile picture
    setupHoverEffects() {
        const profileContainer = document.querySelector('.section__pic-container.spotify-enhanced');
        
        if (profileContainer) {
            profileContainer.addEventListener('mouseenter', () => {
                console.log('hover detected - activating visuals');
                this.activateVisuals();
            });
            
            profileContainer.addEventListener('mouseleave', () => {
                console.log('hover ended - deactivating visuals');
                this.deactivateVisuals();
            });
        }
    }
    
    //start all visual effects when hovering
    activateVisuals() {
        //ensure we always have colors available for visuals
        if (!this.currentColors || this.currentColors.length === 0) {
            console.log('no colors available, using fallback colors');
            this.currentColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
        }
        
        console.log('activating visuals with colors:', this.currentColors);
        
        this.visualsActive = true;
        
        //wait a moment for album image to load if needed
        setTimeout(() => {
            this.changeBodyBackground();
        }, 100);
        
        this.startParticleSystem();
        this.startRhythmLines();
        this.applyDynamicTheme();
    }

    //stop all visual effects when not hovering
    deactivateVisuals() {
        console.log('deactivating visuals');
        this.visualsActive = false;
        this.stopVisualEffects();
        this.resetBodyBackground();
    }

    //change body background to dynamic gradient based on album colors with album image overlay
    changeBodyBackground() {
        console.log('changing background with colors:', this.currentColors);
        
        const colors = this.currentColors;
        const primaryColor = colors[Math.floor(Math.random() * colors.length)];
        const secondaryColor = colors[Math.floor(Math.random() * colors.length)];
        const tertiaryColor = colors[Math.floor(Math.random() * colors.length)];
        
        //create different gradient options
        const gradients = [
            `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            `linear-gradient(45deg, ${primaryColor}, ${secondaryColor}, ${tertiaryColor})`,
            `radial-gradient(circle at 30% 70%, ${primaryColor}, ${secondaryColor})`,
            `conic-gradient(from 45deg, ${primaryColor}, ${secondaryColor}, ${tertiaryColor}, ${primaryColor})`
        ];
        
        const selectedGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        console.log('applying gradient:', selectedGradient);
        
        //create or update the background overlay
        this.createBackgroundOverlay(selectedGradient);
    }

    //create full-screen background overlay with gradient and album image
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
                z-index: -1;
                opacity: 0;
                transition: opacity 0.8s ease;
                pointer-events: none;
            `;
            document.body.appendChild(backgroundOverlay);
        }
        
        //get current album image
        const albumImage = document.getElementById('album-image');
        const albumImageUrl = albumImage ? albumImage.src : '';
        
        //create layered background with gradient and album image
        if (albumImageUrl) {
            //create multiple layers for better visual effect
            backgroundOverlay.style.background = `
                ${gradient},
                linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)),
                url('${albumImageUrl}') center/cover no-repeat
            `;
            backgroundOverlay.style.backgroundBlendMode = 'normal, multiply, soft-light';
        } else {
            backgroundOverlay.style.background = gradient;
        }
        
        //show the overlay
        backgroundOverlay.style.opacity = '0.85';
        
        //ensure navigation and other elements stay on top
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.position = 'relative';
            nav.style.zIndex = '1000';
        }
        
        //ensure all content sections stay above the background
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.position = 'relative';
            section.style.zIndex = '10';
        });
    }

    //reset body background to original color and remove overlay
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
        
        //reset navigation z-index
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.position = '';
            nav.style.zIndex = '';
        }
        
        //reset sections z-index
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.position = '';
            section.style.zIndex = '';
        });
    }

    //create floating particles that move across screen
    startParticleSystem() {
        const container = document.getElementById('music-particles');
        if (!container || !this.visualsActive) return;
        
        container.style.opacity = '1';
        
        const createParticle = () => {
            if (!this.visualsActive) return;
            
            const particle = document.createElement('div');
            particle.className = 'music-particle';
            
            const colors = this.currentColors;
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
        
        //create new particles every 200ms
        this.particleInterval = setInterval(createParticle, 200);
    }

    //create rhythm lines that sweep across screen
    startRhythmLines() {
        const container = document.getElementById('rhythm-lines');
        if (!container || !this.visualsActive) return;
        
        container.style.opacity = '1';
        
        const createRhythmLine = () => {
            if (!this.visualsActive) return;
            
            const line = document.createElement('div');
            line.className = 'rhythm-line';
            
            const colors = this.currentColors;
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
        
        //create new rhythm lines every 800ms
        this.rhythmInterval = setInterval(createRhythmLine, 800);
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

    //apply dynamic theme colors to page elements
    applyDynamicTheme() {
        if (!this.currentColors) return;
        
        const primaryColor = this.currentColors[0];
        const secondaryColor = this.currentColors[1] || primaryColor;
        
        //apply theme to navigation bar
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.background = `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08)`;
            nav.style.backdropFilter = 'blur(20px)';
            nav.style.borderBottom = `1px solid ${primaryColor}20`;
        }
        
        //apply theme to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.boxShadow = `0 4px 15px ${primaryColor}25`;
            btn.style.border = `1px solid ${primaryColor}30`;
        });
        
        //apply theme to project cards
        const cards = document.querySelectorAll('.details-container');
        cards.forEach(card => {
            card.style.borderColor = `${primaryColor}25`;
            card.style.boxShadow = `0 8px 25px ${primaryColor}15`;
            card.style.background = `linear-gradient(135deg, ${primaryColor}02, ${secondaryColor}02)`;
        });
    }

    //reset all theme changes back to original
    resetTheme() {
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.background = '';
            nav.style.backdropFilter = '';
            nav.style.borderBottom = '';
        }
        
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
    
    //sample colors from different parts of the image and convert to hex
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
            
            const brightness = (r + g + b) / 3;
            if (brightness > 50 && brightness < 200) {
                //convert rgb to hex format for consistency
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                colors.push(hex);
            }
        });
        
        //ensure we have unique colors or use fallback
        const uniqueColors = [...new Set(colors)];
        return uniqueColors.length > 0 ? uniqueColors : ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6'];
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
    
    //update track display with current song info
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
        if (lastPlayed) lastPlayed.textContent = 'Authentication needed...';
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
            thomasSpotifyPlayer.currentColors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
            thomasSpotifyPlayer.activateVisuals();
            console.log('visual effects activated with test colors!');
        }
    },
    
    testColorsFromCurrentSong: () => {
        if (thomasSpotifyPlayer && thomasSpotifyPlayer.currentColors) {
            console.log('current extracted colors:', thomasSpotifyPlayer.currentColors);
            thomasSpotifyPlayer.activateVisuals();
        } else {
            console.log('no colors extracted yet - make sure you have a song playing');
        }
    },
    
    stopVisuals: () => {
        if (thomasSpotifyPlayer) {
            thomasSpotifyPlayer.deactivateVisuals();
            console.log('visual effects stopped');
        }
    }
};