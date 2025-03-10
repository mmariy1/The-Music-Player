import { useState, useEffect } from 'react';
import MusicList from './MusicList';
import Player from './MusicPlayer';
import SearchBar from './SearchBar';
import Playlists from './Playlist'
import axios from 'axios';
import PlaylistTracks from './PlaylistTracks'

// Configurações do Spotify
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPE = "streaming user-modify-playback-state playlist-read-private playlist-read-collaborative";

export default function App() {
    const [token, setToken] = useState("");
    const [songs, setSongs] = useState([]);
    const [deviceId, setDeviceId] = useState("");
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistTracks, setPlaylistTracks] = useState({
        uri: "",
        tracks: []
    });

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const token = hash.split("&")[0].split("=")[1];
            window.localStorage.setItem("spotify-token", token);
            window.location.hash = ""; // Limpa o hash da URL
            setToken(token);
        }
    }, []);

    // Verifica o token ao carregar
    useEffect(() => {
        const hash = window.location.hash;
        const storedToken = window.localStorage.getItem("spotify-token");
    
        try {
            if (!storedToken && hash) {
                const token = hash.split("&")[0].split("=")[1];
                if (!token) throw new Error("Token não encontrado no hash");
                
                window.localStorage.setItem("spotify-token", token);
                setToken(token);
                window.history.replaceState({}, document.title, window.location.pathname); // Limpa a URL
            } else {
                setToken(storedToken || "");
            }
        } catch (error) {
            console.error("Erro ao processar token:", error);
            window.localStorage.removeItem("spotify-token");
            setToken("");
        }
    }, []);

    // Função de pesquisa
    const searchSongs = async (query) => {
        try {
            const { data } = await axios.get("https://api.spotify.com/v1/search", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    q: query,
                    type: "track",
                    limit: 10
                }
            });
            setSongs(data.tracks.items);
        } catch (error) {
            console.error("Erro na pesquisa:", error);
            setSongs([]);
        }
    };

    // Função de logout
    const handleLogout = () => {
        window.localStorage.removeItem("spotify-token");
        setToken("");
        setSongs([]);
    };

    //funcao de playlist

    const loadPlaylistTracks = async (playlist) => {
        try {
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setPlaylistTracks({
                uri: playlist.uri,  // URI da playlist para contexto
                tracks: response.data.items.map(item => item.track)
            });
            
            setSelectedPlaylist(playlist.id);
            
        } catch (error) {
            console.error("Erro ao carregar músicas:", error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {!token ? (
                // Tela de Login
                <div className="login-page">
                    <h1>The Music Player</h1>
                    <a
                        className="font"
                        href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&response_type=token`}
                    >
                        Login com Spotify
                    </a>
                </div>
            ) : (
                // Área Logada - CORREÇÃO AQUI
                <div>
                    <button 
                        onClick={handleLogout}
                        className="logout-button font"
                    >
                        Sair
                    </button>
                    <div className="app-title">
                        <h1 className="title">The Music Player</h1>
                        <h1 style={{ textAlign: 'center', fontWeight: '200', margin: '35px 0 50px 0' }}>Pesquisar Músicas</h1>
                    </div>
                    
                    <div className="search-and-player">
                        {/* Coluna da Esquerda - Pesquisa e Resultados */}
                        <div className="search-and-results">
                            <SearchBar onSearch={searchSongs} />
                            
                            {songs.length > 0 && (
                                <div style={{ marginTop: '30px' }}>
                                    <MusicList 
                                        songs={songs} 
                                        token={token} 
                                        deviceId={deviceId} 
                                    />
                                </div>
                            )}
                        </div>

                        <div className="player-div">
                            <Player token={token} setDeviceId={setDeviceId} />
                        </div>
                    </div>

                    {/* Seção de Playlists - CORREÇÃO AQUI */}
                    {selectedPlaylist ? (
                        <PlaylistTracks 
                            tracks={playlistTracks.tracks}
                            playlistUri={playlistTracks.uri}
                            onBack={() => {
                                setSelectedPlaylist(null);
                                setPlaylistTracks({ uri: "", tracks: [] });
                            }}
                            token={token}
                            deviceId={deviceId}
                        />
                    ) : (
                        <Playlists 
                            token={token} 
                            onPlaylistClick={loadPlaylistTracks}
                        />
                    )}
                </div>  // ✅ Fecha a div principal da área logada
            )}
        </div>  // ✅ Fecha a div do container principal
    );
}