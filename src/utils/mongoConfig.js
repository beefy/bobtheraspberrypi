// MongoDB Configuration
export const MONGODB_CONFIG = {
  connectionString: process.env.REACT_APP_MONGODB_URI || 'mongodb://localhost:27017/bobtheraspberrypi',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

// Database and Collection Names
export const DB_NAMES = {
  MAIN: 'bobtheraspberrypi',
  CHESS: 'chess_data',
  SYSTEM: 'system_data',
  CRYPTO: 'crypto_data',
  STATUS: 'status_data'
};

export const COLLECTIONS = {
  CHESS: {
    GAMES: 'games',
    ANALYSIS: 'analysis',
    TOURNAMENTS: 'tournaments'
  },
  SYSTEM: {
    HEALTH: 'health_metrics',
    PERFORMANCE: 'performance',
    LOGS: 'system_logs'
  },
  CRYPTO: {
    PORTFOLIO: 'portfolio',
    PRICES: 'price_data',
    ALERTS: 'price_alerts',
    TRADES: 'trade_history'
  },
  STATUS: {
    SERVICES: 'service_status',
    ACTIVITIES: 'recent_activities',
    NOTIFICATIONS: 'notifications'
  }
};