export const authEndpoint = "https://accounts.spotify.com/authorize";

// Replace with your app's client ID, redirect URI and desired scopes
export const clientId = "2de86c0831c247238aee649cc1b0abf8";
export const redirectUri = "http://localhost:3000/redirect";
//export const redirectUri = "https://playlist-musher.herokuapp.com/";

export const scopes = [
    "user-top-read",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-read-private",
    "playlist-read-private",
    "user-library-modify",
    "playlist-modify-private",
    "playlist-read-collaborative",
    "playlist-read-private",
    "playlist-modify-public"
];
