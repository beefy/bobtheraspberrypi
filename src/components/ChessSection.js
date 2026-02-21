import React, { useEffect, useState } from 'react';
import { useLichessLiveTV } from '../utils/lichessHooks';

const ChessBoard = ({ channel, gameData, gameState }) => {
  const [gameInfo, setGameInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamePosition = async () => {
      if (!gameData?.gameId) return;
      
      try {
        setLoading(true);
        // Fetch current game state from Lichess API
        const response = await fetch(`https://lichess.org/api/game/${gameData.gameId}`);
        if (response.ok) {
          const data = await response.json();
          setGameInfo(data);
        } else {
          console.warn('Could not fetch game details');
        }
      } catch (error) {
        console.error('Error fetching game position:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamePosition();
    
    // Refresh game info every 30 seconds
    const interval = setInterval(fetchGamePosition, 30000);
    return () => clearInterval(interval);
  }, [gameData?.gameId]);

  if (loading) {
    return (
      <div className="chess-board-container">
        <div className="chess-board-placeholder">
          <div className="loading-spinner">⏳ Loading game...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chess-board-container">
      {/* Simple visual chess board placeholder */}
      <div className="chess-board-visual">
        <div className="chess-grid">
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isLight = (row + col) % 2 === 0;
            return (
              <div 
                key={i} 
                className={`chess-square ${isLight ? 'light' : 'dark'}`}
              ></div>
            );
          })}
        </div>
        <div className="chess-overlay">
          <div className="game-link">
            <a 
              href={`https://lichess.org/${gameData.gameId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="play-button"
            >
              ▶️ Watch Live on Lichess
            </a>
          </div>
        </div>
      </div>
      
      {gameInfo && (
        <div className="game-details">
          <div className="players">
            <div className="player white">
              <span className="color-indicator">⚪</span>
              <span className="name">{gameInfo.players?.white?.user?.name || 'Anonymous'}</span>
              <span className="rating">({gameInfo.players?.white?.rating || '?'})</span>
            </div>
            <div className="vs">VS</div>
            <div className="player black">
              <span className="color-indicator">⚫</span>
              <span className="name">{gameInfo.players?.black?.user?.name || 'Anonymous'}</span>
              <span className="rating">({gameInfo.players?.black?.rating || '?'})</span>
            </div>
          </div>
          <div className="game-meta">
            <span className="time-control">{gameInfo.clock?.initial ? `${gameInfo.clock.initial / 60}+${gameInfo.clock.increment}` : 'Unknown time'}</span>
            <span className="separator">•</span>
            <span className="game-status">{gameInfo.status === 'started' ? '🔴 Live' : gameInfo.status}</span>
          </div>
          {gameInfo.moves && (
            <div className="move-count">
              Moves: {gameInfo.moves.split(' ').length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ChessSection = ({ data }) => {
  const { games, gameStates, loading, error, refetch, isStreaming } = useLichessLiveTV(['bullet', 'blitz', 'rapid']);

  if (loading) {
    return (
      <section className="content-section">
        <div className="section-header">
          <h2>♟️ Chess</h2>
        </div>
        <div className="section-content">
          <div className="loading-container">
            <p>Loading live chess games...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="content-section">
        <div className="section-header">
          <h2>♟️ Chess</h2>
        </div>
        <div className="section-content">
          <div className="error-container">
            <p>Error loading chess games: {error}</p>
            <button onClick={refetch} className="retry-button">Retry</button>
          </div>
        </div>
      </section>
    );
  }

  const getChannelTitle = (channel) => {
    const titles = {
      bullet: '🔥 Bullet Chess TV',
      blitz: '⚡ Blitz Chess TV', 
      rapid: '🏃 Rapid Chess TV'
    };
    return titles[channel] || `♟️ ${channel} Chess TV`;
  };

  const getChannelDescription = (channel, gameData, gameState) => {
    const { user, rating, color } = gameData;
    
    // Ensure we're working with strings, not objects
    const playerName = user?.title ? `${user.title} ${user.name || user.id || 'Unknown'}` : (user?.name || user?.id || 'Unknown Player');
    const playerRating = rating || 'Unrated';
    const playerColor = color || 'unknown';
    
    const streamingStatus = isStreaming(channel) ? '🔴 LIVE' : '⭕ Updating';
    
    return `${streamingStatus} • ${playerName} (${playerRating}) as ${playerColor}`;
  };

  const getGameStatus = (gameState) => {
    if (!gameState) return '';
    
    if (gameState.status) {
      const statusMap = {
        started: '▶️ In Progress',
        mate: '👑 Checkmate',
        resign: '🏳️ Resignation',
        stalemate: '🤝 Stalemate',
        timeout: '⏰ Time Out',
        draw: '🤝 Draw',
        aborted: '❌ Aborted'
      };
      return statusMap[gameState.status] || gameState.status;
    }
    
    return '';
  };

  return (
    <section className="content-section">
      <div className="section-header">
        <h2>♟️ Chess</h2>
        <p className="section-subtitle">Live streaming games from Lichess TV</p>
      </div>
      <div className="section-content">
        <div className="content-grid">
          {Object.entries(games).map(([channel, gameData]) => {
            const gameState = gameStates[channel];
            const gameStatus = getGameStatus(gameState);
            
            return (
              <div key={channel} className="content-card chess-game-card">
                <div className="chess-card-header">
                  <h3>{getChannelTitle(channel)}</h3>
                  <p className="game-info">{getChannelDescription(channel, gameData, gameState)}</p>

                  {gameState?.lastUpdate && (
                    <p className="last-update">
                      Updated: {new Date(gameState.lastUpdate).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="chess-game-container">
                  <ChessBoard 
                    channel={channel}
                    gameData={gameData}
                    gameState={gameState}
                  />
                  {isStreaming(channel) && (
                    <div className="live-indicator">
                      <span className="live-dot"></span>
                      LIVE
                    </div>
                  )}
                </div>
                <div className="chess-card-footer">
                  <a 
                    href={`https://lichess.org/tv/${channel}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-on-lichess"
                  >
                    Watch {channel} TV on Lichess →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        
        {Object.keys(games).length === 0 && (
          <div className="no-games-container">
            <p>No live games available at the moment.</p>
            <button onClick={refetch} className="retry-button">Refresh</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChessSection;