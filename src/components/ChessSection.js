import React from 'react';
import { useLichessTV, getLichessEmbedUrl } from '../utils/lichessHooks';

const ChessSection = ({ data }) => {
  const { games, loading, error, refetch } = useLichessTV(['bullet', 'blitz', 'rapid'], 30000);

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

  const getChannelDescription = (channel, gameData) => {
    const { user, rating, color } = gameData;
    const playerName = user.title ? `${user.title} ${user.name}` : user.name;
    return `${playerName} (${rating}) playing as ${color}`;
  };

  return (
    <section className="content-section">
      <div className="section-header">
        <h2>♟️ Chess</h2>
        <p className="section-subtitle">Live games from Lichess TV</p>
      </div>
      <div className="section-content">
        <div className="content-grid">
          {Object.entries(games).map(([channel, gameData]) => (
            <div key={channel} className="content-card chess-game-card">
              <div className="chess-card-header">
                <h3>{getChannelTitle(channel)}</h3>
                <p className="game-info">{getChannelDescription(channel, gameData)}</p>
              </div>
              <div className="chess-game-container">
                <iframe 
                  src={getLichessEmbedUrl(gameData.gameId, { 
                    theme: 'auto',
                    bg: 'auto', 
                    coords: '1',
                    title: '0'
                  })} 
                  width="100%" 
                  height="400"
                  style={{ border: 'none', borderRadius: '8px' }}
                  title={`Lichess ${channel} TV - ${gameData.user.name}`}
                  allowFullScreen
                />
              </div>
              <div className="chess-card-footer">
                <a 
                  href={`https://lichess.org/${gameData.gameId}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-on-lichess"
                >
                  View on Lichess →
                </a>
              </div>
            </div>
          ))}
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