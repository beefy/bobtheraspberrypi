import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const LICHESS_API_BASE = 'https://lichess.org/api';

/**
 * Utility to parse NDJSON stream
 * @param {string} text - NDJSON text
 * @returns {array} Array of parsed JSON objects
 */
const parseNDJSON = (text) => {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.warn('Failed to parse line:', line);
        return null;
      }
    })
    .filter(obj => obj !== null);
};

/**
 * Hook to stream live chess games from Lichess TV with real-time updates
 * @param {string[]} channels - Array of TV channels to stream (bullet, blitz, rapid, etc.)
 * @returns {object} { games, gameStates, loading, error, refetch }
 */
export const useLichessLiveTV = (channels = ['bullet', 'blitz', 'rapid']) => {
  const [games, setGames] = useState({});
  const [gameStates, setGameStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const streamsRef = useRef({});
  const abortControllersRef = useRef({});

  const cleanupStreams = () => {
    // Abort all active streams
    Object.values(abortControllersRef.current).forEach(controller => {
      controller.abort();
    });
    abortControllersRef.current = {};
    streamsRef.current = {};
  };

  const startGameStream = async (channel, gameId) => {
    if (streamsRef.current[channel]) {
      return; // Stream already active
    }

    try {
      const controller = new AbortController();
      abortControllersRef.current[channel] = controller;

      const response = await fetch(`${LICHESS_API_BASE}/stream/game/${gameId}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/x-ndjson'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      streamsRef.current[channel] = reader;

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            lines.forEach(line => {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  
                  // Update game state with live data
                  setGameStates(prev => ({
                    ...prev,
                    [channel]: {
                      ...prev[channel],
                      ...data,
                      lastUpdate: Date.now()
                    }
                  }));
                } catch (e) {
                  console.warn('Failed to parse stream data:', line);
                }
              }
            });
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error(`Stream error for ${channel}:`, error);
          }
        } finally {
          delete streamsRef.current[channel];
          delete abortControllersRef.current[channel];
        }
      };

      readStream();
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(`Failed to start stream for ${channel}:`, error);
      }
      delete streamsRef.current[channel];
      delete abortControllersRef.current[channel];
    }
  };

  const fetchTVChannelsAndStream = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${LICHESS_API_BASE}/tv/channels`);
      const allChannels = response.data;
      
      // Filter to requested channels
      const filteredChannels = {};
      const newGameIds = {};
      
      channels.forEach(channel => {
        if (allChannels[channel]) {
          filteredChannels[channel] = allChannels[channel];
          newGameIds[channel] = allChannels[channel].gameId;
        }
      });
      
      setGames(filteredChannels);
      setError(null);
      
      // Start streaming for new games
      Object.entries(newGameIds).forEach(([channel, gameId]) => {
        const currentGameId = games[channel]?.gameId;
        if (gameId !== currentGameId) {
          // New game, start streaming
          if (abortControllersRef.current[channel]) {
            abortControllersRef.current[channel].abort();
          }
          startGameStream(channel, gameId);
        }
      });
      
    } catch (err) {
      console.error('Error fetching Lichess TV channels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTVChannelsAndStream();
    
    // Refresh channel list every 60 seconds to catch new games
    const interval = setInterval(fetchTVChannelsAndStream, 60000);
    
    return () => {
      clearInterval(interval);
      cleanupStreams();
    };
  }, []);

  // Cleanup on channel changes
  useEffect(() => {
    return () => cleanupStreams();
  }, [channels.join(',')]);

  return {
    games,
    gameStates,
    loading,
    error,
    refetch: fetchTVChannelsAndStream,
    isStreaming: (channel) => !!streamsRef.current[channel]
  };
};

/**
 * Hook to stream a specific live game
 * @param {string} gameId - Lichess game ID
 * @returns {object} { gameData, loading, error, isLive }
 */
export const useLichessLiveGame = (gameId) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const streamRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!gameId) return;

    const startStream = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cleanup existing stream
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await fetch(`${LICHESS_API_BASE}/stream/game/${gameId}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/x-ndjson'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        streamRef.current = reader;
        setIsLive(true);
        setLoading(false);

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            setIsLive(false);
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          lines.forEach(line => {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                setGameData(prev => ({
                  ...prev,
                  ...data,
                  lastUpdate: Date.now()
                }));
              } catch (e) {
                console.warn('Failed to parse game stream data:', line);
              }
            }
          });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Game stream error:', error);
          setError(error.message);
        }
        setIsLive(false);
      } finally {
        streamRef.current = null;
        setLoading(false);
      }
    };

    startStream();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsLive(false);
    };
  }, [gameId]);

  return { 
    gameData, 
    loading, 
    error, 
    isLive,
    reconnect: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Re-trigger the effect by updating a dummy state
      setLoading(true);
    }
  };
};

/**
 * Hook to fetch a specific game's data
 * @param {string} gameId - Lichess game ID
 * @returns {object} { game, loading, error }
 */
export const useLichessGame = (gameId) => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${LICHESS_API_BASE}/game/export/${gameId}`);
        setGame(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  return { game, loading, error };
};

/**
 * Utility to get the embeddable URL for a Lichess game
 * @param {string} gameId - Lichess game ID
 * @param {object} options - Options for the embed
 * @returns {string} Embed URL
 */
export const getLichessEmbedUrl = (gameId, options = {}) => {
  const { 
    theme = 'auto',
    bg = 'auto',
    coords = '1',
    title = '1'
  } = options;
  
  const params = new URLSearchParams({
    theme,
    bg,
    coords,
    title
  });
  
  return `https://lichess.org/embed/game/${gameId}?${params.toString()}`;
};

export default {
  useLichessLiveTV,
  useLichessLiveGame,
  useLichessGame,
  getLichessEmbedUrl
};