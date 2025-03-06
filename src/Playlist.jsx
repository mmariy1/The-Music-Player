import { useState, useEffect } from 'react';
import axios from 'axios';

const Playlists = ({ token, onPlaylistClick }) => {
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoading(true);
                
                if (!token) {
                    throw new Error('Token de autenticação não disponível');
                }

                const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                setPlaylists(response.data.items);
                setError(null);
            } catch (error) {
                console.error('Erro detalhado:', {
                    status: error.response?.status,
                    message: error.response?.data?.error?.message || error.message
                });
                
                setError(error.response?.data?.error?.message || 'Erro ao carregar playlists');
                
                if (error.response?.status === 401) {
                    window.localStorage.removeItem("spotify-token");
                    window.location.reload();
                }
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPlaylists();
        }
    }, [token]);

    if (loading) {
        return <div className="loading-message">Carregando playlists...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">❗ {error}</div>
                <button 
                    onClick={() => window.location.reload()}
                    className="reload-button"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="playlists-container">
            <h2>Suas Playlists</h2>
            
            {playlists.length === 0 ? (
                <div className="empty-state">
                    <span className="music-icon">🎵</span>
                    <p>Nenhuma playlist encontrada</p>
                </div>
            ) : (
                <div className="playlists-grid">
                    {playlists.map((playlist) => (
                        <div 
                            key={playlist.id} 
                            className="playlist-card"
                            onClick={() => onPlaylistClick(playlist)}
                        >
                            <div className="playlist-image">
                                {playlist.images?.length > 0 ? (
                                    <img 
                                        src={playlist.images[0].url} 
                                        alt={playlist.name} 
                                        loading="lazy"
                                        className="img-play"
                                    />
                                ) : (
                                    <div className="placeholder-image">
                                        <span className="music-icon">🎶</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="playlist-info">
                                <h3>{playlist.name}</h3>
                                <div className="playlist-stats">
                                    <span className="song-total">{playlist.tracks.total} músicas</span>
                                    <span className="owner artist">
                                        {playlist.owner?.display_name || 'Spotify'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Playlists;