import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  {
    id: 1,
    title: 'Night Changes',
    artist: 'One Direction',
    duration: '03:46',
    src: 'https://p.scdn.co/mp3-preview/8b4aa4ee753c15c1553c7e993e0937d24d02257e'
  },
  {
    id: 2,
    title: 'Tu Aake Dekhle',
    artist: 'King',
    duration: '04:30',
    src: 'https://p.scdn.co/mp3-preview/df3c6939c4dcf167f809eb588853c8e13213cf67'
  },
  {
    id: 3,
    title: 'blue',
    artist: 'yung kai',
    duration: '03:34',
    src: 'https://p.scdn.co/mp3-preview/4f9ec59f25eb7b2dbe9fc052d23957116a4d5ba5'
  },
  {
    id: 4,
    title: 'Somewhere Only We Know',
    artist: 'rhianne',
    duration: '03:04',
    src: 'https://p.scdn.co/mp3-preview/de3a83df3ed6cd4b9890eeee2e3eeaec308405ff'
  }
];

export default function SpotifyPlaylist() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const isFirstMount = useRef(true);

  const currentTrack = TRACKS[trackIndex];

  // Handle track change
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [trackIndex]);

  // Handle play/pause toggle
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleNext = () => {
    setCurrentTime(0);
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setCurrentTime(0);
    setTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleSelectTrack = (idx) => {
    setCurrentTime(0);
    setTrackIndex(idx);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 30);
    }
  };

  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="compact-music-card">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />

      {/* Header bar: Status + Track dots indicator + Counter */}
      <div className="compact-header">
        <div className="compact-status">
          <span className={`compact-status-dot ${isPlaying ? 'live' : ''}`} />
          <span className="compact-status-text">{isPlaying ? 'NOW PLAYING' : 'PLAYLIST'}</span>
        </div>

        <div className="compact-header-right">
          <div className="compact-track-dots">
            {TRACKS.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTrack(idx)}
                className={`compact-dot ${idx === trackIndex ? 'active' : ''}`}
                title={`Track ${idx + 1}: ${t.title}`}
                aria-label={`Select track ${idx + 1}`}
              />
            ))}
          </div>
          <span className="compact-counter">{trackIndex + 1}/{TRACKS.length}</span>
        </div>
      </div>

      {/* UPPER PART: Only ONE track shown at a time */}
      <div
        className="compact-track-single"
        onClick={togglePlay}
        role="button"
        tabIndex={0}
        title="Click to play/pause"
      >
        <div className="single-track-left">
          {isPlaying ? (
            <div className="compact-equalizer">
              <span className="c-bar bar-1" />
              <span className="c-bar bar-2" />
              <span className="c-bar bar-3" />
            </div>
          ) : (
            <div className="single-track-num-box">
              <span className="single-track-num">{trackIndex + 1}</span>
            </div>
          )}
          <div className="single-track-info">
            <span className="single-track-title">{currentTrack.title}</span>
            <span className="single-track-artist">{currentTrack.artist}</span>
          </div>
        </div>
        <span className="single-track-duration">{currentTrack.duration}</span>
      </div>

      {/* Scrubber progress */}
      <div className="compact-scrubber-wrapper">
        <input
          type="range"
          min="0"
          max={duration || 30}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="compact-scrubber"
          aria-label="Audio progress slider"
        />
        <div className="compact-time-row">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || 30)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="compact-controls">
        <button
          type="button"
          onClick={toggleMute}
          className="compact-mute-btn"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label="Toggle mute"
        >
          {isMuted ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        <div className="compact-playback-btns">
          <button
            type="button"
            onClick={handlePrev}
            className="compact-nav-btn"
            title="Previous Song"
            aria-label="Previous Song"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="compact-play-btn"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1.5" />
                <rect x="14" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="compact-nav-btn"
            title="Next Song"
            aria-label="Next Song"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="3" />
            </svg>
          </button>
        </div>

        <div style={{ width: '22px' }} />
      </div>
    </div>
  );
}





