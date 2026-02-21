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
 * Hook to fetch live chess games from Lichess TV with real-time updates
 * @param {string[]} channels - Array of TV channels to fetch (bullet, blitz, rapid, etc.)
 * @param {number} refreshInterval - How often to refresh data in milliseconds
 * @returns {object} { games, gameStates, loading, error, refetch }
 */
export const useLichessLiveTV = (channels = ['bullet', 'blitz', 'rapid'], refreshInterval = 15000) => {
  const [games, setGames] = useState({});
  const [gameStates, setGameStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchTVChannels = async () => {
    try {
      const response = await axios.get(`${LICHESS_API_BASE}/tv/channels`);
      const allChannels = response.data;
      
      // Filter to requested channels and fetch additional game details
      const filteredChannels = {};
      const newGameStates = {};
      
      for (const channel of channels) {
        if (allChannels[channel]) {
          const channelData = allChannels[channel];
          filteredChannels[channel] = channelData;
          
          // Try to get more detailed game info
          try {
            const gameResponse = await axios.get(`${LICHESS_API_BASE}/game/${channelData.gameId}`, {
              timeout: 5000
            });
            
            newGameStates[channel] = {
              gameId: channelData.gameId,
              lastUpdate: Date.now(),
              status: gameResponse.data.status || 'started',
              moves: gameResponse.data.moves || '',
              players: gameResponse.data.players || {},
              clock: gameResponse.data.clock || null
            };
          } catch (gameErr) {
            console.warn(`Could not fetch details for game ${channelData.gameId}:`, gameErr.message);
            // Fallback to basic data
            newGameStates[channel] = {
              gameId: channelData.gameId,
              lastUpdate: Date.now(),
              status: 'started'
            };
          }
        }
      }
      
      setGames(filteredChannels);
      setGameStates(newGameStates);
      setError(null);
    } catch (err) {
      console.error('Error fetching Lichess TV channels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTVChannels();
    
    // Set up polling interval
    intervalRef.current = setInterval(fetchTVChannels, refreshInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, channels.join(',')]);

  return {
    games,
    gameStates,
    loading,
    error,
    refetch: fetchTVChannels,
    isStreaming: (channel) => !!games[channel] // Always true if we have the game
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
    title = '0'
  } = options;
  
  const params = new URLSearchParams({
    theme,
    bg,
    coords,
    title
  });
  
  return `https://lichess.org/embed/game/${gameId}?${params.toString()}`;
};

/**
 * Utility to get the TV embed URL for a Lichess channel
 * @param {string} channel - TV channel (bullet, blitz, rapid, etc.)
 * @param {object} options - Options for the embed
 * @returns {string} TV Embed URL
 */
export const getLichessTVEmbedUrl = (channel, options = {}) => {
  const { 
    theme = 'auto',
    bg = 'auto',
    coords = '1',
    title = '0'
  } = options;
  
  const params = new URLSearchParams({
    theme,
    bg,
    coords,
    title
  });
  
  return `https://lichess.org/tv/${channel}/embed?${params.toString()}`;
};

export default {
  useLichessLiveTV,
  useLichessLiveGame,
  useLichessGame,
  getLichessEmbedUrl
};