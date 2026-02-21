// MongoDB initialization script
db = db.getSiblingDB('bobtheraspberrypi');

// Create collections
db.createCollection('chess_games');
db.createCollection('chess_analysis');
db.createCollection('chess_tournaments');
db.createCollection('system_health');
db.createCollection('system_performance');
db.createCollection('system_logs');
db.createCollection('crypto_portfolio');
db.createCollection('crypto_prices');
db.createCollection('crypto_alerts');
db.createCollection('crypto_trades');
db.createCollection('service_status');
db.createCollection('recent_activities');
db.createCollection('notifications');

// Create indexes for better performance
db.chess_games.createIndex({ "createdAt": -1 });
db.chess_games.createIndex({ "white": 1, "black": 1 });
db.system_health.createIndex({ "timestamp": -1 });
db.crypto_prices.createIndex({ "symbol": 1, "timestamp": -1 });
db.recent_activities.createIndex({ "createdAt": -1 });

// Insert sample data
db.service_status.insertMany([
  {
    serviceName: 'web-frontend',
    status: 'online',
    details: { responseTime: 45 },
    createdAt: new Date(),
    type: 'service_status'
  },
  {
    serviceName: 'api-backend',
    status: 'online',
    details: { responseTime: 120 },
    createdAt: new Date(),
    type: 'service_status'
  },
  {
    serviceName: 'mongodb',
    status: 'online',
    details: { responseTime: 15 },
    createdAt: new Date(),
    type: 'service_status'
  }
]);

db.recent_activities.insertMany([
  {
    action: 'System Started',
    details: { component: 'frontend' },
    severity: 'info',
    createdAt: new Date(),
    type: 'activity_log'
  },
  {
    action: 'Database Connected',
    details: { component: 'mongodb' },
    severity: 'info',
    createdAt: new Date(),
    type: 'activity_log'
  }
]);

print('Database initialized successfully!');