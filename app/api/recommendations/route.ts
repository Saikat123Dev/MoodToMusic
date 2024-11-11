import { NextResponse } from 'next/server';
import axios from 'axios';

// Function to fetch songs from Spotify API
async function fetchSpotifySongs(mood: string) {
  // Get Spotify access token using client credentials flow
  const token = await getSpotifyAccessToken();

  const moodToGenre: { [key: string]: string } = {
    happy: "pop",
    sad: "indie",
    energetic: "dance",
    calm: "chill",
    angry: "rock",
    neutral: "classical",
    // You can add more mood-genre mappings as necessary
  };

  const genre = moodToGenre[mood.toLowerCase()] || "pop"; // Default to 'pop' if not found

  const options = {
    method: 'GET',
    url: 'https://api.spotify.com/v1/recommendations',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      seed_genres: genre, // Use the genre mapped to the mood
      limit: 100,           // Limit to 20 recommendations
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.tracks?.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists?.map((artist: any) => artist.name).join(', '),
      genre: track.genres?.[0] || "Unknown",
      mood: mood.toLowerCase(),
      url: track.external_urls.spotify,
      image: track.album?.images?.[0]?.url || null,
      preview: track.preview_url || null,  // Adding preview URL if available
    })) || [];
  } catch (error) {
    console.error('Error fetching from Spotify:', error);
    throw error; // Propagate error to be handled by the main function
  }
}

// Function to get Spotify access token (Client Credentials Flow)
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID; // Your Spotify Client ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET; // Your Spotify Client Secret

  const authString = `${clientId}:${clientSecret}`;
  const encodedAuth = Buffer.from(authString).toString('base64');

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: `Basic ${encodedAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

export async function POST(req: Request) {
  try {
    const { dominantEmotion } = await req.json();

    if (!dominantEmotion) {
      return NextResponse.json(
        { error: 'dominantEmotion is required' },
        { status: 400 }
      );
    }

    // Map emotions to more music-relevant search terms
    const moodSearchTerms: { [key: string]: string } = {
      happy: "upbeat cheerful",
      sad: "melancholic emotional",
      energetic: "upbeat energetic dance",
      calm: "peaceful ambient relaxing",
      angry: "intense powerful",
      neutral: "moderate balanced"
      // Add more mappings as needed
    };

    const searchMood = moodSearchTerms[dominantEmotion.toLowerCase()] || dominantEmotion;

    // Fetch songs from Spotify API
    const recommendations = await fetchSpotifySongs(searchMood);

    // If no songs found, return fallback recommendations
    if (recommendations.length === 0) {
      return NextResponse.json({
        recommendations: recommendations.slice(0, 100),
        source: 'mood-only'
      });
    }

    return NextResponse.json({
      recommendations: recommendations.slice(0, 100),
      source: 'mood-only'
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      {
        error: 'Failed to get recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
