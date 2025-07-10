const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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
      case 'lyrics':
        return await getLyrics(event);
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

//database functions connecting to supabase
async function saveTokens(accessToken, refreshToken, expiresIn) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  
  const { error } = await supabase
    .from('spotify_tokens')
    .upsert({
      id: 'thomas',
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString()
    });
    
  if (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
}

async function getTokens() {
  const { data, error } = await supabase
    .from('spotify_tokens')
    .select('*')
    .eq('id', 'thomas')
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error getting tokens:', error);
    throw error;
  }
  
  return data;
}

//generate authorization URL
async function handleAuth() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scopes = 'user-read-currently-playing user-read-recently-played user-read-playback-state';
  
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `code_challenge_method=S256&` +
    `code_challenge=${codeChallenge}&` +
    `state=${codeVerifier}`;

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify({ authUrl })
  };
}

// Handle callback and save tokens to database
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
  const codeVerifier = state;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Spotify token error:', errorData);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Save tokens to database
    await saveTokens(data.access_token, data.refresh_token, data.expires_in);
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Authentication successful! Tokens saved to database. You will never need to authenticate again!',
        success: true
      })
    };

  } catch (error) {
    console.error('Callback error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Authentication failed', 
        details: error.message 
      })
    };
  }
}

// Get current track with automatic token refresh
async function getCurrentTrack() {
  try {
    const tokenData = await getTokens();
    
    if (!tokenData) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No tokens found', needsAuth: true })
      };
    }
    
    let accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresAt = new Date(tokenData.expires_at);
    
    // Check if token needs refresh (5 minutes before expiry)
    if (new Date() >= new Date(expiresAt.getTime() - 300000)) {
      console.log('Token expired, refreshing...');
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

    // Get currently playing
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
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

        console.log('Raw Spotify data:', data);


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
    console.error('getCurrentTrack error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch current track' })
    };
  }
}

// Refresh access token and save to database
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) return null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    // Save new tokens to database
    await saveTokens(
      data.access_token, 
      data.refresh_token || refreshToken, // Sometimes Spotify doesn't send new refresh token
      data.expires_in
    );
    
    console.log('Tokens refreshed and saved to database');
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

// Get lyrics from lyrics.ovh API
async function getLyrics(event) {
  const { artist, title } = event.queryStringParameters || {};
  
  if (!artist || !title) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Artist and title required' })
    };
  }

  try {
    // Clean up artist and title for API call
    const cleanArtist = artist.replace(/\s+/g, '%20');
    const cleanTitle = title.replace(/\s+/g, '%20');
    
    const lyricsUrl = `https://api.lyrics.ovh/v1/${cleanArtist}/${cleanTitle}`;
    const response = await fetch(lyricsUrl);

    if (!response.ok) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Lyrics not found' })
      };
    }

    const data = await response.json();
    
    if (!data.lyrics) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No lyrics in response' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist: artist,
        title: title,
        lyrics: data.lyrics
      })
    };

  } catch (error) {
    console.error('Lyrics fetch error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch lyrics' })
    };
  }
}