import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { useLichessLiveTV, useLichessGameStream } from '../utils/lichessHooks';
import '../styles/chessground.css';

const ChessBoard = ({ channel, gameData, gameState }) => {
  const [gameInfo, setGameInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chessGame, setChessGame] = useState(new Chess()); // Start with starting position
  
  // Use the new polling hook to get real-time game data with moves
  const { 
    gameData: liveGameData, 
    moves: liveMoves, 
    isLive, 
    error: streamError,
    loading: streamLoading
  } = useLichessGameStream(gameData?.gameId);

  useEffect(() => {
    // Combine polling data with TV channel data
    if (liveGameData || gameData) {
      const combinedGameInfo = {
        ...gameData,
        ...liveGameData,
        moves: liveMoves?.join(' ') || null,
        movesArray: liveMoves || [],
        isLive: isLive,
        streamError: streamError
      };
      
      setGameInfo(combinedGameInfo);
      
      // Update chess position with moves from the API
      if (liveMoves && liveMoves.length > 0) {
        try {
          const newGame = new Chess(); // Start fresh
          
          console.log('Applying moves to board:', liveMoves);
          
          // Apply each move sequentially
          for (const move of liveMoves) {
            try {
              newGame.move(move);
            } catch (moveErr) {
              console.warn(`Invalid move: ${move}`, moveErr);
              break;
            }
          }
          
          console.log('Board updated. FEN:', newGame.fen());
          setChessGame(newGame);
        } catch (err) {
          console.warn('Error updating chess position:', err);
        }
      } else {
        // No moves = starting position
        console.log('No moves, showing starting position');
        setChessGame(new Chess());
      }
      
      setLoading(false);
    }
  }, [liveGameData, gameData, liveMoves, isLive, streamError]);

  if ((loading || streamLoading) && !streamError) {
    return (
      <div className="chess-board-container">
        <div className="chess-board-placeholder">
          <div className="loading-spinner">
            {isLive ? '🔄 Loading live game...' : '⏳ Connecting to game...'}
          </div>
        </div>
      </div>
    );
  }

  if (streamError) {
    return (
      <div className="chess-board-container">
        <div className="chess-board-placeholder">
          <div className="loading-spinner">⚠️ {streamError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chess-board-container">
      {/* Chess board visualization with live positions */}
      <div className="chess-board-visual">
        <div className="chess-grid">
          {Array.from({ length: 64 }).map((_, i) => {
            // Calculate row and column from index
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isLight = (row + col) % 2 === 0;
            
            // Convert to chess coordinates (a1-h8)
            // Row 0 = rank 8, Row 7 = rank 1 (flipped for display)
            const rank = 8 - row;
            const file = String.fromCharCode(97 + col); // a-h
            const square = file + rank; // e.g., 'e4'
            
            // Get piece from current chess position
            const piece = chessGame.get(square);
            
            const getPieceSymbol = (piece) => {
              if (!piece) return '';
              
              const symbols = {
                'k': piece.color === 'w' ? '♔' : '♚', // King
                'q': piece.color === 'w' ? '♕' : '♛', // Queen  
                'r': piece.color === 'w' ? '♖' : '♜', // Rook
                'b': piece.color === 'w' ? '♗' : '♝', // Bishop
                'n': piece.color === 'w' ? '♘' : '♞', // Knight
                'p': piece.color === 'w' ? '♙' : '♟'  // Pawn
              };
              
              return symbols[piece.type] || '';
            };
            
            const pieceSymbol = getPieceSymbol(piece);
            
            return (
              <div 
                key={i} 
                className={`chess-square ${isLight ? 'light' : 'dark'}`}
                data-square={square}
                title={`${square}${piece ? ` - ${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : ''}`}
              >
                {pieceSymbol && (
                  <span className="chess-piece">{pieceSymbol}</span>
                )}
              </div>
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
            {gameInfo?.movesArray?.length > 0 && (
              <div className="moves-info">
                <span className="move-count">{gameInfo.movesArray.length} moves played</span>
                <span className="current-turn">
                  {chessGame.turn() === 'w' ? "White's turn" : "Black's turn"}
                </span>
                {chessGame.isCheck() && <span className="check-indicator">♔ Check!</span>}
                {chessGame.isCheckmate() && <span className="checkmate-indicator">♔ Checkmate!</span>}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {gameInfo && (
        <div className="game-details">
          <div className="players">
            <div className="player white">
              <span className="color-indicator">⚪</span>
              <span className="name">{gameInfo.players?.white?.userId || 'Anonymous'}</span>
              <span className="rating">({gameInfo.players?.white?.rating || '?'})</span>
            </div>
            <div className="vs">VS</div>
            <div className="player black">
              <span className="color-indicator">⚫</span>
              <span className="name">{gameInfo.players?.black?.userId || 'Anonymous'}</span>
              <span className="rating">({gameInfo.players?.black?.rating || '?'})</span>
            </div>
          </div>
          <div className="game-meta">
            <span className="time-control">{gameInfo.clock?.initial ? `${gameInfo.clock.initial / 60}+${gameInfo.clock.increment}` : 'Unknown time'}</span>
            <span className="separator">•</span>
            <span className="game-status">
              {isLive ? '🟢 Live Stream' : (gameInfo.status === 'draw' ? '🤝 Draw' : gameInfo.status)}
            </span>
            <span className="separator">•</span>
            <span className="turn-info">Turn {gameInfo.turns || gameInfo.movesArray?.length || 'Unknown'}</span>
          </div>
          
          {gameInfo.movesArray && gameInfo.movesArray.length > 0 && (
            <div className="moves-section">
              <div className="moves-header">Live Moves ({gameInfo.movesArray.length}):</div>
              <div className="moves-list">
                {gameInfo.movesArray.slice(-8).map((move, idx, arr) => (
                  <span key={idx} className={`move ${idx === arr.length - 1 ? 'latest-move' : ''}`}>
                    {move}
                  </span>
                ))}
              </div>
            </div>
          )}

          {gameInfo.moves && !gameInfo.movesArray && (
            <div className="moves-section">
              <div className="moves-header">Game Moves ({gameInfo.moves.split(' ').length}):</div>
              <div className="moves-list">
                {gameInfo.moves.split(' ').slice(-8).map((move, idx, arr) => (
                  <span key={idx} className={`move ${idx === arr.length - 1 ? 'latest-move' : ''}`}>
                    {move}
                  </span>
                ))}
              </div>
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