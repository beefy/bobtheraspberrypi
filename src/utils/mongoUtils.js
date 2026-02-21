/**
 * MongoDB utilities for data processing and validation
 */

/**
 * Format timestamp for database storage
 * @param {Date} date - Date object
 * @returns {Object} Formatted timestamp object
 */
export const formatTimestamp = (date = new Date()) => {
  return {
    timestamp: date,
    iso: date.toISOString(),
    unix: Math.floor(date.getTime() / 1000)
  };
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Create standardized document structure
 * @param {Object} data - Document data
 * @param {string} type - Document type
 * @returns {Object} Standardized document
 */
export const createDocument = (data, type) => {
  const timestamp = formatTimestamp();
  return {
    ...data,
    type,
    createdAt: timestamp.timestamp,
    updatedAt: timestamp.timestamp,
    metadata: {
      source: 'bobtheraspberrypi-frontend',
      version: '1.0.0',
      ...data.metadata
    }
  };
};

/**
 * Chess game utilities
 */
export const ChessUtils = {
  // Validate chess game data
  validateGameData: (gameData) => {
    const required = ['white', 'black', 'result', 'moves'];
    return required.every(field => gameData.hasOwnProperty(field));
  },

  // Format chess game for database
  formatGameForDB: (gameData) => {
    return createDocument({
      white: gameData.white,
      black: gameData.black,
      result: gameData.result,
      moves: gameData.moves,
      timeControl: gameData.timeControl || 'unknown',
      opening: gameData.opening || null,
      fen: gameData.fen || null,
      pgn: gameData.pgn || null,
      rating: {
        white: gameData.whiteRating || null,
        black: gameData.blackRating || null
      }
    }, 'chess_game');
  }
};

/**
 * System metrics utilities
 */
export const SystemUtils = {
  // Validate system metrics
  validateMetrics: (metrics) => {
    const required = ['cpu', 'memory', 'disk'];
    return required.every(field => metrics.hasOwnProperty(field));
  },

  // Format system metrics for database
  formatMetricsForDB: (metrics) => {
    return createDocument({
      cpu: {
        usage: parseFloat(metrics.cpu.usage || 0),
        temperature: parseFloat(metrics.cpu.temperature || 0),
        cores: parseInt(metrics.cpu.cores || 1)
      },
      memory: {
        used: parseInt(metrics.memory.used || 0),
        total: parseInt(metrics.memory.total || 0),
        percentage: parseFloat(metrics.memory.percentage || 0)
      },
      disk: {
        used: parseInt(metrics.disk.used || 0),
        total: parseInt(metrics.disk.total || 0),
        percentage: parseFloat(metrics.disk.percentage || 0)
      },
      network: metrics.network || {},
      processes: metrics.processes || []
    }, 'system_metrics');
  }
};

/**
 * Crypto data utilities
 */
export const CryptoUtils = {
  // Validate crypto price data
  validatePriceData: (priceData) => {
    const required = ['symbol', 'price', 'timestamp'];
    return required.every(field => priceData.hasOwnProperty(field));
  },

  // Format price data for database
  formatPriceDataForDB: (priceData) => {
    return createDocument({
      symbol: priceData.symbol.toUpperCase(),
      price: parseFloat(priceData.price),
      volume24h: parseFloat(priceData.volume24h || 0),
      change24h: parseFloat(priceData.change24h || 0),
      marketCap: parseFloat(priceData.marketCap || 0),
      source: priceData.source || 'unknown'
    }, 'crypto_price');
  },

  // Format portfolio entry
  formatPortfolioEntry: (entry) => {
    return createDocument({
      symbol: entry.symbol.toUpperCase(),
      amount: parseFloat(entry.amount),
      avgBuyPrice: parseFloat(entry.avgBuyPrice || 0),
      totalValue: parseFloat(entry.totalValue || 0),
      allocation: parseFloat(entry.allocation || 0)
    }, 'portfolio_entry');
  }
};

/**
 * Status and activity utilities
 */
export const StatusUtils = {
  // Create activity log entry
  createActivity: (action, details = {}) => {
    return createDocument({
      action,
      details,
      severity: details.severity || 'info',
      component: details.component || 'system',
      user: details.user || 'system'
    }, 'activity_log');
  },

  // Create notification
  createNotification: (title, message, priority = 'normal') => {
    return createDocument({
      title,
      message,
      priority,
      read: false,
      dismissed: false
    }, 'notification');
  },

  // Format service status
  formatServiceStatus: (serviceName, status, details = {}) => {
    return createDocument({
      serviceName,
      status, // 'online', 'offline', 'degraded', 'maintenance'
      details,
      responseTime: details.responseTime || null,
      uptime: details.uptime || null,
      lastChecked: formatTimestamp().timestamp
    }, 'service_status');
  }
};

/**
 * Data aggregation utilities
 */
export const AggregationUtils = {
  // Create time-based aggregation pipeline
  timeBasedAggregation: (timeField = 'createdAt', interval = 'hour') => {
    const intervalMap = {
      hour: { $hour: `$${timeField}` },
      day: { $dayOfYear: `$${timeField}` },
      week: { $week: `$${timeField}` },
      month: { $month: `$${timeField}` }
    };

    return [
      {
        $group: {
          _id: intervalMap[interval],
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' }
        }
      },
      { $sort: { _id: 1 } }
    ];
  },

  // Create trend analysis pipeline
  trendAnalysis: (field, days = 30) => {
    return [
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          value: { $avg: `$${field}` }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ];
  }
};

/**
 * Error handling utilities
 */
export const ErrorUtils = {
  // Create standardized error response
  createErrorResponse: (error, context = {}) => {
    return {
      error: true,
      message: error.message || 'Unknown error occurred',
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: formatTimestamp(),
      context
    };
  },

  // Log error to database
  logError: (error, context = {}) => {
    return createDocument({
      error: error.message || error.toString(),
      stack: error.stack || null,
      context,
      severity: context.severity || 'error'
    }, 'error_log');
  }
};

// Export all utilities
export const MongoUtils = {
  formatTimestamp,
  isValidObjectId,
  createDocument,
  Chess: ChessUtils,
  System: SystemUtils,
  Crypto: CryptoUtils,
  Status: StatusUtils,
  Aggregation: AggregationUtils,
  Error: ErrorUtils
};

export default MongoUtils;