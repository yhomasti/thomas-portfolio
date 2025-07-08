// SPOTIFY.js INTEGRATION
class SpotifyIntegration {
    constructor() {
        this.clientId = 'ee39406874014685bcf8e5a64206de6c'; //my client id I hope this doesn't get leaked
        this.redirectUri = 'https://thomasyi.netlify.app/callback';
        this.scopes = 'user-read-currently-playing user-read-recently-played';
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.refreshToken = localStorage.getItem('spotify_refresh_token');
        
        this.initializeSpotify();
    }
    
    initializeSpotify() {
        //DO WE HAVE TOKENS?
        if (!this.accessToken) {
            this.showOfflineState();
            return;
        }
        
        //this is going to check the current track
        this.checkCurrentTrack();
        setInterval(() => this.checkCurrentTrack(), 30000); //checks every 30 seconds I beleive
    }
    
    async checkCurrentTrack() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.status === 401) {
                //token expired, try to refresh
                await this.refreshAccessToken();
                return this.checkCurrentTrack();
            }
            
            if (response.status === 200) {
                const data = await response.json();
                this.displayCurrentTrack(data);
            } else {
                //not currently playing, check recent tracks.
                this.checkRecentTracks();
            }
        } catch (error) {
            console.log('Spotify API error:', error);
            this.showOfflineState();
        }
    }
    
    async checkRecentTracks() {
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
        
        document.getElementById('song-title').textContent = track.name;
        document.getElementById('artist-name').textContent = track.artists[0].name;
        document.getElementById('album-name').textContent = track.album.name;
        document.getElementById('album-image').src = track.album.images[0]?.url || '';
        
        //show currently playing state
        this.showSpotifyContent();
        
        //add playing indicator if music is playing
        const vinylOverlay = document.querySelector('.vinyl-overlay');
        if (isPlaying) {
            vinylOverlay.style.animationPlayState = 'running';
        } else {
            vinylOverlay.style.animationPlayState = 'paused';
        }
    }
    
    displayRecentTrack(item) {
        const track = item.track;
        
        document.getElementById('song-title').textContent = track.name;
        document.getElementById('artist-name').textContent = track.artists[0].name;
        document.getElementById('album-name').textContent = track.album.name;
        document.getElementById('album-image').src = track.album.images[0]?.url || '';
        
        //show recent track state
        this.showSpotifyContent();
        
        //pause vinyl animation for recent tracks
        document.querySelector('.vinyl-overlay').style.animationPlayState = 'paused';
    }
    
    showSpotifyContent() {
        document.getElementById('spotify-content').style.display = 'flex';
        document.querySelector('.spotify-loading').style.display = 'none';
        document.getElementById('spotify-offline').style.display = 'none';
    }
    
    showOfflineState() {
        document.getElementById('spotify-content').style.display = 'none';
        document.querySelector('.spotify-loading').style.display = 'none';
        document.getElementById('spotify-offline').style.display = 'block';
    }
    
    // Spotify OAuth (for initial setup)
    authenticateSpotify() {
        const authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${this.clientId}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
            `scope=${encodeURIComponent(this.scopes)}`;
        
        window.location.href = authUrl;
    }
    
    async refreshAccessToken() {
        //this would typically be handled by your backend but for now, we'll show offline state if refresh fails
        this.showOfflineState();
    }
}

//TEMPORARY: Mock Spotify data for testing
function initMockSpotify() {
    const mockData = {
        name: "Plants vs. Zombies Theme",
        artists: [{ name: "Laura Shigihara" }],
        album: { 
            name: "Plants vs. Zombies Soundtrack",
            images: [{ url: "https://via.placeholder.com/300x300/1DB954/white?text=PvZ" }]
        }
    };
    
    setTimeout(() => {
        document.getElementById('song-title').textContent = mockData.name;
        document.getElementById('artist-name').textContent = mockData.artists[0].name;
        document.getElementById('album-name').textContent = mockData.album.name;
        document.getElementById('album-image').src = mockData.album.images[0].url;
        
        document.getElementById('spotify-content').style.display = 'flex';
        document.querySelector('.spotify-loading').style.display = 'none';
        
        console.log('Mock Spotify data loaded!');
    }, 2000); //2 second delay to show loading animation
}

//Initialize Spotify integration
let spotifyPlayer;

document.addEventListener('DOMContentLoaded', function() {
    
    // Use real Spotify integration
    spotifyPlayer = new SpotifyIntegration();
    
    // Add a temporary auth button for setup (we'll hide it later)
    const authButton = document.createElement('button');
    authButton.textContent = 'Connect Spotify (Setup Only)';
    authButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px; background: #1DB954; color: white; border: none; border-radius: 5px; cursor: pointer;';
    authButton.onclick = () => spotifyPlayer.authenticateSpotify();
    document.body.appendChild(authButton);
});

//Handle OAuth callback (you'll need this page later)
if (window.location.pathname === '/callback') {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        console.log('Spotify auth code:', code);
        window.location.href = '/';
    }
}