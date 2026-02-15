const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const config = require('./config/config');

// Import services and controllers
const UserService = require('./services/UserService');
const ChatService = require('./services/ChatService');
const SocketController = require('./controllers/SocketController');

class ChatServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: config.cors
    });

    // Initialize services
    this.userService = new UserService();
    this.chatService = new ChatService();
    
    // Initialize controllers
    this.socketController = new SocketController(this.io, this.userService, this.chatService);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  setupMiddleware() {
    // Basic middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Health check middleware
    this.app.use('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        users: this.userService.getUserCount(),
        groups: this.chatService.getGroupChatNames().length
      });
    });
  }

  setupRoutes() {
    // Basic route
    this.app.get('/', (req, res) => {
      res.json({
        message: 'WhatsApp Clone Chat Server',
        version: '2.0.0',
        features: [
          'Real-time messaging',
          'Private chats',
          'Group chats',
          'User management',
          'Scalable architecture'
        ]
      });
    });

    // API routes for REST endpoints (future expansion)
    this.app.get('/api/users', (req, res) => {
      res.json({
        users: this.userService.getUsernames(),
        count: this.userService.getUserCount()
      });
    });

    this.app.get('/api/groups', (req, res) => {
      res.json({
        groups: this.chatService.getGroupChatNames()
      });
    });
  }

  setupSocketHandlers() {
    // Setup main socket connection handler
    this.io.on('connection', (socket) => {
      this.socketController.onConnection(socket);
    });
  }

  start() {
    this.server.listen(config.server.port, () => {
      console.log(`🚀 Chat server running on http://${config.server.host}:${config.server.port}`);
      console.log(`🌍 Environment: ${config.environment}`);
      console.log(`✅ Ready to accept connections`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down server gracefully...');
      this.server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  }
}

// Create and start server
const chatServer = new ChatServer();
chatServer.start();

module.exports = ChatServer;