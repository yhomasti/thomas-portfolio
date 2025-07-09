// netlify/functions/spotify.js
exports.handler = async (event, context) => {
  // Enable CORS for your domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action } = event.queryStringParameters || {};

    switch (action) {
      case 'auth':
        return await handleAuth();
      case 'callback':
        return await handleCallback(event);
      case 'current-track':
        return await getCurrentTrack();
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// netlify/functions/spotify.js
exports.handler = async (event, context) => {
  // Enable CORS for your domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action } = event.queryStringParameters || {};

    switch (action) {
      case 'auth':
        return await handleAuth();
      case 'callback':
        return await handleCallback(event);
      case 'current-track':
        return await getCurrentTrack();
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Generate authorization URL
async function handleAuth() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scopes = 'user-read-currently-playing user-read-recently-played user-read-playback-state';
  
  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `code_challenge_method=S256&` +
    `code_challenge=${codeChallenge}&` +
    `state=${codeVerifier}`; // Pass verifier as state

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ authUrl })
  };
}

// Handle callback and exchange code for tokens
async function handleCallback(event) {
  const { code, state } = event.queryStringParameters || {};
  
  if (!code) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No authorization code provided' })
    };
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const codeVerifier = state; // We passed it as state

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const data = await response.json();
    
    // Return tokens for manual setup
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Authentication successful!',
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        note: 'Add these tokens to your Netlify environment variables',
        instructions: {
          SPOTIFY_ACCESS_TOKEN: data.access_token,
          SPOTIFY_REFRESH_TOKEN: data.refresh_token,
          SPOTIFY_TOKEN_EXPIRY: (Date.now() + (data.expires_in * 1000)).toString()
        }
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Token exchange failed' })
    };
  }
}

// Get current track
async function getCurrentTrack() {
  let accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  
  // Check if we need to refresh the token
  const tokenExpiry = process.env.SPOTIFY_TOKEN_EXPIRY;
  const now = Date.now();
  
  if (!accessToken || (tokenExpiry && now >= parseInt(tokenExpiry) - 300000)) {
    // Token expired or will expire in 5 minutes, refresh it
    const refreshed = await refreshAccessToken(refreshToken);
    if (!refreshed) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Token refresh failed', needsAuth: true })
      };
    }
    accessToken = refreshed.access_token;
  }

  try {
    // Get currently playing
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Authentication required', needsAuth: true })
      };
    }

    if (response.status === 200) {
      const data = await response.json();
      if (data && data.item) {
        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isPlaying: data.is_playing,
            track: {
              name: data.item.name,
              artists: data.item.artists.map(a => a.name),
              album: data.item.album.name,
              image: data.item.album.images[0]?.url,
              preview_url: data.item.preview_url
            }
          })
        };
      }
    }

    // No current track, return offline status
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isPlaying: false,
        track: null,
        status: 'offline'
      })
    };

  } catch (error) {
    console.error('Spotify API error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch current track' })
    };
  }
}

// Refresh access token
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) return null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

// PKCE helper functions
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}