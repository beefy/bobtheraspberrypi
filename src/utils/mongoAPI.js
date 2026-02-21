import { MONGODB_CONFIG, DB_NAMES, COLLECTIONS } from './mongoConfig';

// Base API URL - adjust based on your backend setup
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} API response
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Chess-related database operations
 */
export const ChessAPI = {
  // Get all chess games
  getGames: async (limit = 50) => {
    return apiRequest(`/chess/games?limit=${limit}`);
  },

  // Get specific game by ID
  getGame: async (gameId) => {
    return apiRequest(`/chess/games/${gameId}`);
  },

  // Create new game
  createGame: async (gameData) => {
    return apiRequest('/chess/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  },

  // Update game
  updateGame: async (gameId, updateData) => {
    return apiRequest(`/chess/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Get game analysis
  getAnalysis: async (gameId) => {
    return apiRequest(`/chess/analysis/${gameId}`);
  },

  // Get tournament data
  getTournaments: async () => {
    return apiRequest('/chess/tournaments');
  }
};

/**
 * System monitoring database operations
 */
export const SystemAPI = {
  // Get system health metrics
  getHealthMetrics: async (timeRange = '24h') => {
    return apiRequest(`/system/health?range=${timeRange}`);
  },

  // Get performance data
  getPerformanceData: async (timeRange = '24h') => {
    return apiRequest(`/system/performance?range=${timeRange}`);
  },

  // Get system logs
  getLogs: async (level = 'all', limit = 100) => {
    return apiRequest(`/system/logs?level=${level}&limit=${limit}`);
  },

  // Add system metric
  addMetric: async (metricData) => {
    return apiRequest('/system/metrics', {
      method: 'POST',
      body: JSON.stringify(metricData),
    });
  }
};

/**
 * Cryptocurrency database operations
 */
export const CryptoAPI = {
  // Get portfolio data
  getPortfolio: async () => {
    return apiRequest('/crypto/portfolio');
  },

  // Update portfolio
  updatePortfolio: async (portfolioData) => {
    return apiRequest('/crypto/portfolio', {
      method: 'PUT',
      body: JSON.stringify(portfolioData),
    });
  },

  // Get price data
  getPriceData: async (symbols, timeRange = '24h') => {
    const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return apiRequest(`/crypto/prices?symbols=${symbolsParam}&range=${timeRange}`);
  },

  // Set price alert
  setPriceAlert: async (alertData) => {
    return apiRequest('/crypto/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  // Get price alerts
  getPriceAlerts: async () => {
    return apiRequest('/crypto/alerts');
  },

  // Get trade history
  getTradeHistory: async (limit = 50) => {
    return apiRequest(`/crypto/trades?limit=${limit}`);
  },

  // Add trade record
  addTrade: async (tradeData) => {
    return apiRequest('/crypto/trades', {
      method: 'POST',
      body: JSON.stringify(tradeData),
    });
  }
};

/**
 * Status and monitoring database operations
 */
export const StatusAPI = {
  // Get service status
  getServiceStatus: async () => {
    return apiRequest('/status/services');
  },

  // Update service status
  updateServiceStatus: async (service, status) => {
    return apiRequest(`/status/services/${service}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get recent activities
  getRecentActivities: async (limit = 20) => {
    return apiRequest(`/status/activities?limit=${limit}`);
  },

  // Add activity log
  addActivity: async (activityData) => {
    return apiRequest('/status/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  },

  // Get notifications
  getNotifications: async (unreadOnly = false) => {
    return apiRequest(`/status/notifications?unreadOnly=${unreadOnly}`);
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    return apiRequest(`/status/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Create notification
  createNotification: async (notificationData) => {
    return apiRequest('/status/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }
};

/**
 * Generic database operations
 */
export const DatabaseAPI = {
  // Health check
  healthCheck: async () => {
    return apiRequest('/health');
  },

  // Get database statistics
  getStats: async () => {
    return apiRequest('/stats');
  },

  // Search across collections
  search: async (query, collections = []) => {
    const collectionsParam = collections.length > 0 ? `&collections=${collections.join(',')}` : '';
    return apiRequest(`/search?q=${encodeURIComponent(query)}${collectionsParam}`);
  }
};

// Export all APIs as a single object
export const MongoAPI = {
  Chess: ChessAPI,
  System: SystemAPI,
  Crypto: CryptoAPI,
  Status: StatusAPI,
  Database: DatabaseAPI
};

export default MongoAPI;