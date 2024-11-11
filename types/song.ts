// types.ts

export interface Song {
    id: string;      // Unique identifier for the song (as a string)
    title: string;   // Title of the song
    artist: string;  // Artist of the song
    genre: string;   // Genre of the song
    image: string;   // URL to the album cover image
    mood: string;    // Mood associated with the song (e.g., joy, happy, etc.)
    preview: string; // URL to the song preview
    url: string;     // URL to the song on external platform (e.g., Shazam)
}
