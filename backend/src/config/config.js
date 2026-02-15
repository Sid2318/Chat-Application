const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost'
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },

  // Chat configuration
  chat: {
    maxMessageLength: 1000,
    maxUsernameLength: 20,
    minUsernameLength: 2,
    maxGroupNameLength: 30,
    minGroupNameLength: 2,
    messageHistoryLimit: 100
  },

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;