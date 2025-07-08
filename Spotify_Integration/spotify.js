// Auto-Refreshing Spotify Integration - Connect Once, Works Forever
class PersonalSpotifyIntegration {
    constructor() {
        this.clientId = 'ee39406874014685bcf8e5a64206de6c';
        this.redirectUri = 'https://thomasyi.netlify.app/';
        this.scopes = 'user-read-currently-playing user-read-recently-played user-read-playback-state';
        
        // Token management
        this.accessToken = localStorage.getItem('thomas_spotify_access_token');
        this.refreshToken = localStorage.getItem('thomas_spotify_refresh_token');
        this.tokenExpiry = localStorage.getItem('thomas_spotify_token_expiry');
        
        this.initializeDisplay();
    }
    
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
        
        // If we have tokens, try to use them (will auto-refresh if needed)
        if (this.hasAnyToken()) {
            this.startMusicDisplay();
        } else {
            this.showOfflineState();
            this.addOwnerAuthButton();
        }
    }
    
    hasAnyToken() {
        return !!(this.accessToken || this.refreshToken);
    }
    
    hasValidToken() {
        if (!this.accessToken || !this.tokenExpiry) return false;
        // Add 5 minute buffer to refresh before expiry
        return Date.now() < (parseInt(this.tokenExpiry) - 300000);
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
            console.log('Got authorization code, exchanging for tokens...');
            
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            if (!codeVerifier) {
                console.error('Code verifier not found');
                return;
            }
            
            try {
                await this.exchangeCodeForToken(code, codeVerifier);
                localStorage.removeItem('spotify_code_verifier');
                window.history.replaceState({}, document.title, window.location.pathname);
                
                this.startMusicDisplay();
                
                // Remove auth button permanently
                const authButton = document.querySelector('.owner-auth-btn');
                if (authButton) authButton.remove();
                
                console.log('✅ Thomas\'s Spotify connected permanently!');
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
        
        // Store both access and refresh tokens
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        const expiryTime = Date.now() + (data.expires_in * 1000);
        
        localStorage.setItem('thomas_spotify_access_token', this.accessToken);
        localStorage.setItem('thomas_spotify_refresh_token', this.refreshToken);
        localStorage.setItem('thomas_spotify_token_expiry', expiryTime.toString());
        
        console.log('✅ Tokens saved! Auto-refresh enabled.');
    }
    
    // AUTO-REFRESH FUNCTIONALITY - This is the key part!
    async refreshAccessToken() {
        if (!this.refreshToken) {
            console.log('No refresh token available, need to re-authenticate');
            this.showOfflineState();
            this.addOwnerAuthButton();
            return false;
        }
        
        console.log('🔄 Auto-refreshing Spotify token...');
        
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken,
                    client_id: this.clientId,
                }),
            });
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            const data = await response.json();
            
            // Update access token
            this.accessToken = data.access_token;
            const expiryTime = Date.now() + (data.expires_in * 1000);
            
            localStorage.setItem('thomas_spotify_access_token', this.accessToken);
            localStorage.setItem('thomas_spotify_token_expiry', expiryTime.toString());
            
            // Sometimes Spotify sends a new refresh token
            if (data.refresh_token) {
                this.refreshToken = data.refresh_token;
                localStorage.setItem('thomas_spotify_refresh_token', this.refreshToken);
            }
            
            console.log('✅ Token auto-refreshed successfully!');
            return true;
            
        } catch (error) {
            console.error('Auto-refresh failed:', error);
            // If refresh fails, clear tokens and show auth button
            this.clearTokens();
            this.showOfflineState();
            this.addOwnerAuthButton();
            return false;
        }
    }
    
    startMusicDisplay() {
        this.checkThomasCurrentTrack();
        // Check music every 30 seconds
        this.updateInterval = setInterval(() => this.checkThomasCurrentTrack(), 30000);
        
        // Auto-refresh token when needed (check every 10 minutes)
        this.refreshInterval = setInterval(() => this.checkAndRefreshToken(), 600000);
    }
    
    async checkAndRefreshToken() {
        if (!this.hasValidToken() && this.refreshToken) {
            await this.refreshAccessToken();
        }
    }
    
    async checkThomasCurrentTrack() {
        // Auto-refresh token if needed before making API call
        if (!this.hasValidToken()) {
            if (this.refreshToken) {
                const refreshed = await this.refreshAccessToken();
                if (!refreshed) return;
            } else {
                this.showOfflineState();
                return;
            }
        }
        
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.status === 401) {
                // Token expired, try to refresh
                if (this.refreshToken) {
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        // Retry the request with new token
                        return this.checkThomasCurrentTrack();
                    }
                }
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
        
        const loadingText = document.querySelector('.spotify-loading span');
        if (loadingText) {
            loadingText.textContent = isPlaying ? 'Thomas is currently listening to...' : 'Thomas was just listening to...';
        }
        
        this.updateTrackDisplay(track, isPlaying);
        this.showSpotifyContent();
    }
    
    displayRecentTrack(item) {
        const track = item.track;
        
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
        
        const offlineText = document.querySelector('.offline-text');
        const lastPlayed = document.querySelector('.last-played');
        if (offlineText) offlineText.textContent = 'Thomas is offline!';
        if (lastPlayed) lastPlayed.textContent = 'He\'ll probably listen to some music soon...';
    }
    
    async authenticateOwner() {
        try {
            const codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);
            
            localStorage.setItem('spotify_code_verifier', codeVerifier);
            
            const authUrl = `https://accounts.spotify.com/authorize?` +
                `client_id=${this.clientId}&` +
                `response_type=code&` +
                `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
                `scope=${encodeURIComponent(this.scopes)}&` +
                `code_challenge_method=S256&` +
                `code_challenge=${codeChallenge}&` +
                `show_dialog=false`;  // Changed to false so it doesn't ask every time
            
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
        this.refreshToken = null;
        this.tokenExpiry = null;
        
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }
    
    // Only show auth button if no tokens exist at all
    addOwnerAuthButton() {
        // Only show if we have NO tokens at all
        if (this.refreshToken) return;
        
        if (!document.querySelector('.owner-auth-btn')) {
            const authButton = document.createElement('button');
            authButton.className = 'owner-auth-btn';
            authButton.textContent = 'Connect Thomas\'s Spotify (One Time Setup)';
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
    
    // Manual disconnect (only if you want to reset everything)
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

// Enhanced debug tools
window.spotifyDebug = {
    checkToken: () => {
        const token = localStorage.getItem('thomas_spotify_access_token');
        const refresh = localStorage.getItem('thomas_spotify_refresh_token');
        const expiry = localStorage.getItem('thomas_spotify_token_expiry');
        
        console.log('Access Token:', token ? 'Present' : 'Missing');
        console.log('Refresh Token:', refresh ? 'Present ✅' : 'Missing ❌');
        console.log('Expires:', expiry ? new Date(parseInt(expiry)).toLocaleString() : 'N/A');
        console.log('Valid:', thomasSpotifyPlayer?.hasValidToken());
        console.log('Time until expiry:', expiry ? Math.round((parseInt(expiry) - Date.now()) / 60000) + ' minutes' : 'N/A');
    },
    
    forceRefresh: () => {
        thomasSpotifyPlayer?.refreshAccessToken();
    },
    
    clearTokens: () => {
        thomasSpotifyPlayer?.clearTokens();
        console.log('All tokens cleared - will need to reconnect');
    },
    
    forceAuth: () => {
        thomasSpotifyPlayer?.authenticateOwner();
    },
    
    checkNow: () => {
        thomasSpotifyPlayer?.checkThomasCurrentTrack();
    }
};