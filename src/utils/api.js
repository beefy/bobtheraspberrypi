/**
 * API client for Bob the Raspberry Pi backend
 * This abstracts away the backend implementation details
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.bobtheraspberrypi.com/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    // Ensure proper URL joining
    const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const url = `${cleanBaseURL}${cleanEndpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// API client instance
const apiClient = new ApiClient();

/**
 * Chess API functions
 */
export const ChessAPI = {
  getGames: (limit = 20, offset = 0) => 
    apiClient.get('/chess/games', { limit, offset }),
  
  getGame: (gameId) => 
    apiClient.get(`/chess/games/${gameId}`),
  
  createGame: (gameData) => 
    apiClient.post('/chess/games', gameData),
  
  updateGame: (gameId, gameData) => 
    apiClient.put(`/chess/games/${gameId}`, gameData),
  
  deleteGame: (gameId) => 
    apiClient.delete(`/chess/games/${gameId}`),
  
  getAnalysis: (gameId) => 
    apiClient.get(`/chess/analysis/${gameId}`),
  
  getTournaments: () => 
    apiClient.get('/chess/tournaments'),
};

/**
 * System API functions
 */
export const SystemAPI = {
  getHealthMetrics: (timeRange = '24h') => 
    apiClient.get('/system/health', { timeRange }),
  
  getPerformanceMetrics: (timeRange = '24h') => 
    apiClient.get('/system/performance', { timeRange }),
  
  getLogs: (level = 'info', limit = 100) => 
    apiClient.get('/system/logs', { level, limit }),
  
  getSystemInfo: () => 
    apiClient.get('/system/info'),
  
  getSystemInfoTimeseries: (agentName, startDate, endDate, limit = 50, skip = 0) => 
    apiClient.get('/v1/system-info/', {
      agent_name: agentName,
      start_date: startDate,
      end_date: endDate,
      limit,
      skip
    }),
  
  addMetric: (metricData) => 
    apiClient.post('/system/metrics', metricData),
};

/**
 * Crypto API functions
 */
export const CryptoAPI = {
  getPortfolio: () => 
    apiClient.get('/crypto/portfolio'),
  
  getPrices: (symbols = []) => 
    apiClient.get('/crypto/prices', { symbols: symbols.join(',') }),
  
  getAlerts: () => 
    apiClient.get('/crypto/alerts'),
  
  createAlert: (alertData) => 
    apiClient.post('/crypto/alerts', alertData),
  
  getTradeHistory: (limit = 50) => 
    apiClient.get('/crypto/trades', { limit }),
  
  updatePortfolio: (portfolioData) => 
    apiClient.put('/crypto/portfolio', portfolioData),
};

/**
 * Status API functions
 */
export const StatusAPI = {
  getOverallStatus: () => 
    apiClient.get('/status/overall'),
  
  getServiceHealth: () => 
    apiClient.get('/status/services'),
  
  getRecentActivities: (limit = 20) => 
    apiClient.get('/status/activities', { limit }),
  
  getNotifications: (unreadOnly = false) => 
    apiClient.get('/status/notifications', { unreadOnly }),
  
  markNotificationRead: (notificationId) => 
    apiClient.put(`/status/notifications/${notificationId}/read`),
  
  createActivity: (activityData) => 
    apiClient.post('/status/activities', activityData),
};

/**
 * Generic API utilities
 */
export const API = {
  Chess: ChessAPI,
  System: SystemAPI,
  Crypto: CryptoAPI,
  Status: StatusAPI,
  
  // Health check
  health: () => apiClient.get('/health'),
  
  // Generic data fetching
  fetch: (endpoint, options) => apiClient.request(endpoint, options),
};

export default API;