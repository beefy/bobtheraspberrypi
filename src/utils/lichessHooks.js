import { useState, useEffect } from 'react';
import axios from 'axios';

const LICHESS_API_BASE = 'https://lichess.org/api';

/**
 * Hook to fetch live chess games from Lichess TV
 * @param {string[]} channels - Array of TV channels to fetch (bullet, blitz, rapid, etc.)
 * @param {number} refreshInterval - How often to refresh data in milliseconds
 * @returns {object} { games, loading, error, refetch }
 */
export const useLichessTV = (channels = ['bullet', 'blitz', 'rapid'], refreshInterval = 30000) => {
  const [games, setGames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTVChannels = async () => {
    try {
      const response = await axios.get(`${LICHESS_API_BASE}/tv/channels`);
      const allChannels = response.data;
      
      // Filter to requested channels
      const filteredChannels = {};
      channels.forEach(channel => {
        if (allChannels[channel]) {
          filteredChannels[channel] = allChannels[channel];
        }
      });
      
      setGames(filteredChannels);
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
    
    const interval = setInterval(fetchTVChannels, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    games,
    loading,
    error,
    refetch: fetchTVChannels
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
  useLichessTV,
  useLichessGame,
  getLichessEmbedUrl
};