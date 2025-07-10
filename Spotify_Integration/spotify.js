//spotify.js for serverless backend
class ServerlessSpotifyIntegration {
    constructor() {
        this.baseUrl = '/.netlify/functions/spotify';
        this.initializeDisplay();
    }
    
    initializeDisplay() {
        this.startMusicDisplay();
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
        
        // Update status text
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
        
        // Control vinyl animation
        if (elements.vinyl) {
            elements.vinyl.classList.remove('playing', 'paused');
            elements.vinyl.classList.add(isPlaying ? 'playing' : 'paused');
        }
        
        // Add audio preview button if preview URL exists
        if (track.preview_url) {
            this.addAudioPreviewButton({ track, isPlaying });
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


    addAudioPreviewButton(trackData) {
    //remove existing button
    const existingBtn = document.querySelector('.audio-preview-btn');
    if (existingBtn) existingBtn.remove();
    
    //add preview button to the album art
    const albumArt = document.querySelector('.album-art');
    if (albumArt) {
        const previewBtn = document.createElement('button');
        previewBtn.className = 'audio-preview-btn';
        previewBtn.innerHTML = '▶️';
        previewBtn.title = 'Preview track with visualization';
        
        let isPlaying = false;
        
        previewBtn.onclick = (e) => {
            e.stopPropagation();
            
            if (!isPlaying) {
                audioViz.playPreview(trackData.track.preview_url, trackData.track);
                previewBtn.innerHTML = '⏸️';
                previewBtn.classList.add('playing');
                isPlaying = true;
                
                //auto-stop after 30 seconds
                setTimeout(() => {
                    if (isPlaying) {
                        previewBtn.innerHTML = '▶️';
                        previewBtn.classList.remove('playing');
                        isPlaying = false;
                    }
                }, 30000);
                
            } else {
                audioViz.stopPreview();
                previewBtn.innerHTML = '▶️';
                previewBtn.classList.remove('playing');
                isPlaying = false;
            }
        };
        
        albumArt.appendChild(previewBtn);
    }
}
}

// Initialize when DOM is loaded
let thomasSpotifyPlayer;

document.addEventListener('DOMContentLoaded', function() {
    thomasSpotifyPlayer = new ServerlessSpotifyIntegration();
});

// Debug tools
window.spotifyDebug = {
    checkNow: () => {
        thomasSpotifyPlayer?.checkThomasCurrentTrack();
    },
    
    testAuth: () => {
        thomasSpotifyPlayer?.authenticateOwner();
    }
};

class AudioVisualizationEngine {
    constructor() {
        this.audioContext = null;
        this.audioElement = null;
        this.analyser = null;
        this.dataArray = null;
        this.isPlaying = false;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.currentTrack = null;
        
        this.setupCanvas();
        this.setupAudioContext();
    }
    
    setupCanvas() {
        // Create background canvas for visualization
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'audio-viz-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.3;
            pointer-events: none;
            mix-blend-mode: screen;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        } catch (error) {
            console.log('Web Audio API not supported:', error);
        }
    }
    
    async playPreview(previewUrl, trackData) {
        if (!previewUrl || !this.audioContext) return;
        
        // Stop current audio if playing
        this.stopPreview();
        
        try {
            // Create audio element
            this.audioElement = new Audio();
            this.audioElement.crossOrigin = 'anonymous';
            this.audioElement.volume = 0.3; // Keep it subtle
            
            // Connect to analyser
            const source = this.audioContext.createMediaElementSource(this.audioElement);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.audioElement.src = previewUrl;
            this.currentTrack = trackData;
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Start playing and visualizing
            await this.audioElement.play();
            this.isPlaying = true;
            this.startVisualization();
            
            // Stop after 30 seconds
            setTimeout(() => this.stopPreview(), 30000);
            
        } catch (error) {
            console.log('Audio playback failed:', error);
        }
    }
    
    stopPreview() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clearCanvas();
    }
    
    startVisualization() {
        if (!this.isPlaying || !this.analyser) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        this.drawVisualization();
        
        this.animationId = requestAnimationFrame(() => this.startVisualization());
    }
    
    drawVisualization() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, width, height);
        
        // Get average volume for global effects
        const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
        const intensity = average / 255;
        
        // Draw frequency bars
        this.drawFrequencyBars(intensity);
        
        // Draw pulsing circles
        this.drawPulsingCircles(intensity);
        
        // Draw wave patterns
        this.drawWavePatterns(intensity);
    }
    
    drawFrequencyBars(intensity) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.dataArray.length * 2;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const barHeight = (this.dataArray[i] / 255) * height * 0.5;
            
            // Create gradient based on frequency
            const gradient = this.ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, `hsla(${i * 2 + intensity * 60}, 70%, 50%, 0.8)`);
            gradient.addColorStop(1, `hsla(${i * 2 + intensity * 60}, 70%, 70%, 0.3)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
        }
    }
    
    drawPulsingCircles(intensity) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.8;
        
        // Draw multiple concentric circles
        for (let i = 0; i < 5; i++) {
            const radius = (maxRadius * intensity * (1 + i * 0.2)) + (i * 50);
            const opacity = Math.max(0, 0.4 - i * 0.08) * intensity;
            
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `hsla(${intensity * 180 + 120}, 70%, 60%, ${opacity})`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }
    
    drawWavePatterns(intensity) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Create flowing wave pattern
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        
        for (let x = 0; x < width; x++) {
            const y = height / 2 + 
                     Math.sin((x * 0.01) + (Date.now() * 0.005)) * intensity * 100 +
                     Math.sin((x * 0.005) + (Date.now() * 0.003)) * intensity * 50;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.strokeStyle = `hsla(${intensity * 120 + 60}, 80%, 60%, ${intensity * 0.6})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Initialize the audio visualization
const audioViz = new AudioVisualizationEngine();

