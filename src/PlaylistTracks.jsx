import React from 'react';
import axios from 'axios'

const PlaylistTracks = ({ tracks, playlistUri, onBack, token, deviceId }) => {

    const playTrack = (trackUri) => {
        axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, 
            {
                context_uri: playlistUri,
                offset: { uri: trackUri },
                position_ms: 0
            },
            { headers: { Authorization: `Bearer ${token}` } }
        ).catch(error => console.error("Erro ao tocar:", error));
    };

    return (
        <div className="playlist-tracks-container">
            <button onClick={onBack} className="back-button">
                ← Voltar para Playlists
            </button>
            
            <div className="tracks-list playlists-grid">
                {tracks.map((track) => (
                    <div 
                        key={track.id} 
                        className="track-item" 
                        onClick={() => playTrack(track.uri)}
                    >
                        <img 
                            src={track.album.images[0]?.url} 
                            alt={track.name}
                            className="track-image img-play"
                        />
                        <div className="track-info">
                            <h3 className="name-song">{track.name}</h3>
                            <p className="artist">{track.artists.map(artist => artist.name).join(', ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlaylistTracks;