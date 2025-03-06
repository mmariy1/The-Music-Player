import { useEffect, useState, useRef } from 'react';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import PauseOutlined from '@mui/icons-material/PauseOutlined';
import SkipPreviousOutlined from '@mui/icons-material/SkipPreviousOutlined';
import SkipNextOutlined from '@mui/icons-material/SkipNextOutlined';
import MusicNoteOutlined from '@mui/icons-material/MusicNoteOutlined'

export default function Player({ token, setDeviceId }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [position, setPosition] = useState(0);
    const [nextTracks, setNextTracks] = useState([]);
    const playerRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: "Meu Player",
                getOAuthToken: cb => cb(token),
                volume: 0.8
            });

            player.addListener('ready', ({ device_id }) => {
                console.log("Dispositivo conectado:", device_id);
                setDeviceId(device_id);
                playerRef.current = player;
            });

            player.addListener('player_state_changed', state => {
                if (!state) return;
                
                setIsPlaying(!state.paused);
                setCurrentTrack(state.track_window.current_track);
                setPosition(state.position);
                setNextTracks(state.track_window.next_tracks);
            });

            player.connect();

            intervalRef.current = setInterval(() => {
                player.getCurrentState().then(state => {
                    if (state) setPosition(state.position);
                });
            }, 1000);

            return () => {
                clearInterval(intervalRef.current);
                player.disconnect();
            };
        };

        return () => {
            document.body.removeChild(script);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [token]);

    const handlePlayPause = async () => {
        if (!playerRef.current) return;
        await playerRef.current.togglePlay();
    };

    const handleNext = async () => {
        if (!playerRef.current) return;
        await playerRef.current.nextTrack();
    };

    const handlePrevious = async () => {
        if (!playerRef.current) return;
        await playerRef.current.previousTrack();
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="music-player">
            {currentTrack ? (
                <div className="player-main-column">
                    {/* Informações do Artista */}
                    <div className="track-artist">
                        {currentTrack.artists?.map(artist => artist.name).join(", ")}
                    </div>
    
                    {/* Capa do Álbum */}
                    <div className={`album-cover ${isPlaying ? 'playing' : ''}`}>
                        <img 
                            src={currentTrack.album?.images?.[0]?.url} 
                            alt={currentTrack.name} 
                            className="album-cover-img"
                        />
                    </div>
    
                    {/* Nome da Música */}
                    <div className="track-title">
                        {currentTrack.name}
                    </div>
    
                    {/* Barra de Progresso */}
                    <div className="progress-container">
                        <div className="time-display">
                            <span>{formatTime(position)}</span>
                            <span>{formatTime(currentTrack.duration_ms)}</span>
                        </div>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar"
                                style={{ 
                                    width: `${(position / currentTrack.duration_ms) * 100}%`,
                                    transition: 'width 0.5s linear' 
                                }}
                            />
                        </div>
                    </div>
    
                    {/* Controles */}
                    <div className="player-controls">
                        <button 
                            onClick={handlePrevious}
                            className="play-pause-btn-main"
                            disabled={!nextTracks?.length}
                        >
                            <SkipPreviousOutlined sx={{ 
                                fontSize: 40,
                                color: '#E8D8E9', 
                                '&:hover': {
                                    color: '#AEA1AE', 
                                    cursor: 'pointer'
                                },
                                transition: 'color 0.3s ease' 
                            }} />
                        </button>
    
                        <button 
                            onClick={handlePlayPause}
                            className="play-pause-btn-main"
                        >
                            {isPlaying ? (
                                <PauseOutlined sx={{ 
                                    fontSize: 40,
                                    color: '#E8D8E9',
                                    '&:hover': {
                                        color: '#AEA1AE', 
                                        cursor: 'pointer'
                                    },
                                    transition: 'color 0.3s ease'
                                }} />
                            ) : (
                                <PlayArrowOutlined sx={{ 
                                    fontSize: 40,
                                    color: '#E8D8E9',
                                    '&:hover': {
                                        color: '#AEA1AE',
                                        cursor: 'pointer'
                                    },
                                    transition: 'color 0.3s ease'
                                }} />
                            )}
                        </button>
    
                        <button 
                            onClick={handleNext}
                            className="play-pause-btn-main"
                            disabled={!nextTracks?.length}
                        >
                            <SkipNextOutlined 
                                sx={{ 
                                    fontSize: 40,
                                    color: '#ECE2EF',
                                    '&:hover': {
                                        color: '#AEA1AE',
                                        cursor: 'pointer'
                                    },
                                    transition: 'color 0.3s ease'
                                }}
                            />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="empty-player">
                    <h1 className="track-artist empty-artist">Toque uma musica</h1>
                    <div className="empty-player-icon">
                        <MusicNoteOutlined sx={{ fontSize: 210, color: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'grey', borderRadius: '50%' }} />
                    </div>
                    <p className="empty-player-text track-title">Nenhuma música tocando...</p>
                </div>
            )}
        </div>
    )}