// Personal Spotify Integration - Using Authorization Code with PKCE
// This is the more reliable method for Spotify Web API

class PersonalSpotifyIntegration {
    constructor() {
        this.clientId = 'ee39406874014685bcf8e5a64206de6c';
        this.redirectUri = 'https://thomasyi.netlify.app/';
        this.scopes = 'user-read-currently-playing user-read-recently-played user-read-playback-state';
        
        // These will store YOUR authentication tokens
        this.accessToken = localStorage.getItem('thomas_spotify_access_token');
        this.tokenExpiry = localStorage.getItem('thomas_spotify_token_expiry');
        
        this.initializeDisplay();
    }
    
    // Generate code verifier and challenge for PKCE
    generateCodeVerifier() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
    
    async generateCodeChallenge(verifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
    
    initializeDisplay() {
        // Check if we just returned from Spotify auth
        this.handleOwnerCallback();
        
        // If we have valid tokens, start showing your music
        if (this.hasValidToken()) {
            this.startMusicDisplay();
        } else {
            this.showOfflineState();
            this.addOwnerAuthButton();
        }
    }
    
    hasValidToken() {
        if (!this.accessToken || !this.tokenExpiry) return false;
        return Date.now() < parseInt(this.tokenExpiry);
    }
    
    async handleOwnerCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
            console.log('Spotify auth error:', error);
            return;
        }
        
        if (code) {
            console.log('Got authorization code, exchanging for token...');
            
            // Get the stored code verifier
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            if (!codeVerifier) {
                console.error('Code verifier not found');
                return;
            }
            
            try {
                await this.exchangeCodeForToken(code, codeVerifier);
                
                // Clean up
                localStorage.removeItem('spotify_code_verifier');
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Start displaying music
                this.startMusicDisplay();
                
                // Remove auth button
                const authButton = document.querySelector('.owner-auth-btn');
                if (authButton) authButton.remove();
                
                console.log('Thomas\'s Spotify connected successfully!');
            } catch (error) {
                console.error('Token exchange failed:', error);
            }
        }
    }
    
    async exchangeCodeForToken(code, codeVerifier) {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: this.redirectUri,
                client_id: this.clientId,
                code_verifier: codeVerifier,
            }),
        });
        
        if (!response.ok) {
            throw new Error('Token exchange failed');
        }
        
        const data = await response.json();
        
        // Store the access token
        this.accessToken = data.access_token;
        const expiryTime = Date.now() + (data.expires_in * 1000);
        
        localStorage.setItem('thomas_spotify_access_token', this.accessToken);
        localStorage.setItem('thomas_spotify_token_expiry', expiryTime.toString());
        
        if (data.refresh_token) {
            localStorage.setItem('thomas_spotify_refresh_token', data.refresh_token);
        }
    }
    
    startMusicDisplay() {
        this.checkThomasCurrentTrack();
        // Update every 30 seconds
        this.updateInterval = setInterval(() => this.checkThomasCurrentTrack(), 30000);
    }
    
    async checkThomasCurrentTrack() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.status === 401) {
                // Token expired
                this.clearTokens();
                this.showOfflineState();
                return;
            }
            
            if (response.status === 200) {
                const data = await response.json();
                if (data && data.item) {
                    this.displayCurrentTrack(data);
                    return;
                }
            }
            
            // If Thomas isn't actively playing, check recent tracks
            this.checkThomasRecentTracks();
            
        } catch (error) {
            console.log('Spotify API error:', error);
            this.showOfflineState();
        }
    }
    
    async checkThomasRecentTracks() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.status === 200) {
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    this.displayRecentTrack(data.items[0]);
                } else {
                    this.showOfflineState();
                }
            } else {
                this.showOfflineState();
            }
        } catch (error) {
            this.showOfflineState();
        }
    }
    
    displayCurrentTrack(data) {
        const track = data.item;
        const isPlaying = data.is_playing;
        
        // Update the loading text
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = isPlaying ? 'Thomas is currently listening to...' : 'Thomas was just listening to...';
        }
        
        this.updateTrackDisplay(track, isPlaying);
        this.showSpotifyContent();
    }
    
    displayRecentTrack(item) {
        const track = item.track;
        
        // Update text to show it's recent
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = 'Thomas was recently listening to...';
        }
        
        this.updateTrackDisplay(track, false);
        this.showSpotifyContent();
    }
    
    updateTrackDisplay(track, isPlaying = false) {
        const elements = {
            title: document.getElementById('song-title'),
            artist: document.getElementById('artist-name'),
            album: document.getElementById('album-name'),
            image: document.getElementById('album-image'),
            vinyl: document.querySelector('.vinyl-overlay')
        };
        
        if (elements.title) elements.title.textContent = track.name;
        if (elements.artist) elements.artist.textContent = track.artists.map(artist => artist.name).join(', ');
        if (elements.album) elements.album.textContent = track.album.name;
        if (elements.image) {
            elements.image.src = track.album.images[0]?.url || '';
            elements.image.alt = `${track.album.name} by ${track.artists[0].name}`;
        }
        
        // Handle vinyl animation
        if (elements.vinyl) {
            elements.vinyl.style.animationPlayState = isPlaying ? 'running' : 'paused';
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
        
        // Update offline message
        const offlineText = document.querySelector('.offline-text');
        const lastPlayed = document.querySelector('.last-played');
        if (offlineText) offlineText.textContent = 'Thomas is offline!';
        if (lastPlayed) lastPlayed.textContent = 'He\'ll probably listen to some music soon...';
    }
    
    // Updated authentication method using PKCE
    async authenticateOwner() {
        try {
            // Generate PKCE parameters
            const codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);
            
            // Store code verifier for later use
            localStorage.setItem('spotify_code_verifier', codeVerifier);
            
            const authUrl = `https://accounts.spotify.com/authorize?` +
                `client_id=${this.clientId}&` +
                `response_type=code&` +
                `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
                `scope=${encodeURIComponent(this.scopes)}&` +
                `code_challenge_method=S256&` +
                `code_challenge=${codeChallenge}&` +
                `show_dialog=true`;
            
            window.location.href = authUrl;
        } catch (error) {
            console.error('Authentication setup failed:', error);
        }
    }
    
    clearTokens() {
        localStorage.removeItem('thomas_spotify_access_token');
        localStorage.removeItem('thomas_spotify_refresh_token');
        localStorage.removeItem('thomas_spotify_token_expiry');
        localStorage.removeItem('spotify_code_verifier');
        this.accessToken = null;
        this.tokenExpiry = null;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
    
    // Only YOU should see this button
    addOwnerAuthButton() {
        if (!document.querySelector('.owner-auth-btn')) {
            const authButton = document.createElement('button');
            authButton.className = 'owner-auth-btn';
            authButton.textContent = 'Connect Thomas\'s Spotify';
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
            
            authButton.addEventListener('mouseover', () => {
                authButton.style.transform = 'translateY(-2px)';
                authButton.style.boxShadow = '0 6px 20px rgba(29, 185, 84, 0.4)';
            });
            
            authButton.addEventListener('mouseout', () => {
                authButton.style.transform = 'translateY(0)';
                authButton.style.boxShadow = '0 4px 15px rgba(29, 185, 84, 0.3)';
            });
            
            authButton.onclick = () => this.authenticateOwner();
            document.body.appendChild(authButton);
        }
    }
    
    disconnect() {
        this.clearTokens();
        this.showOfflineState();
        this.addOwnerAuthButton();
    }
}

// Initialize when DOM is loaded
let thomasSpotifyPlayer;

document.addEventListener('DOMContentLoaded', function() {
    thomasSpotifyPlayer = new PersonalSpotifyIntegration();
});

// Debug tools
window.spotifyDebug = {
    checkToken: () => {
        const token = localStorage.getItem('thomas_spotify_access_token');
        const expiry = localStorage.getItem('thomas_spotify_token_expiry');
        console.log('Thomas\'s Token:', token ? 'Present' : 'Missing');
        console.log('Expires:', expiry ? new Date(parseInt(expiry)).toLocaleString() : 'N/A');
        console.log('Valid:', thomasSpotifyPlayer?.hasValidToken());
    },
    
    clearTokens: () => {
        thomasSpotifyPlayer?.clearTokens();
        console.log('Thomas\'s tokens cleared');
    },
    
    forceAuth: () => {
        thomasSpotifyPlayer?.authenticateOwner();
    },
    
    checkNow: () => {
        thomasSpotifyPlayer?.checkThomasCurrentTrack();
    }
};