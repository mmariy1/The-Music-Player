import axios from 'axios'

const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

export default function MusicList({ songs, token, deviceId }) {
    const playTrack = (trackUri, playlistUri = null) => {
        axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, 
            playlistUri 
            ? { 
                context_uri: playlistUri, // URI da playlist
                offset: { uri: trackUri }, // Música inicial
                position_ms: 0
              }
            : { uris: [trackUri] }, // Fallback para pesquisa
            { headers: { Authorization: `Bearer ${token}` } }
        )
    };
    return (
        <div className="song-results">
            {songs.map(song => (
                    <div key={song.id} onClick={() => playTrack(song.uri)} className="test">
                        <div className="album-img">
                            <img 
                                src={song.album.images[0].url} 
                                alt={song.name} 
                                width={50} 
                            />
                        </div>
                        <div className="song-info">
                            <div className="song-name-artist">
                                <p className="name-song">{song.name}</p>
                                <p className="artist">{song.artists.map(artist => artist.name).join(", ")}</p>
                            </div>
                            <p className="duration">{formatDuration(song.duration_ms)}</p>
                        </div>
                    </div>
            ))}
        </div>
    );
}