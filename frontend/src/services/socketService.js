import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
  }

  // Connect to socket server
  connect(serverUrl = 'http://localhost:3001') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    this.setupDefaultEventListeners();
    return this.socket;
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Setup default event listeners
  setupDefaultEventListeners() {
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to server');
      this.emit('connection_status_changed', { isConnected: true });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from server');
      this.emit('connection_status_changed', { isConnected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection_error', { error });
    });
  }

  // Add event listener
  on(eventName, handler) {
    if (this.socket) {
      this.socket.on(eventName, handler);
    }

    // Store handler for reconnection scenarios
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName).add(handler);
  }

  // Remove event listener
  off(eventName, handler) {
    if (this.socket) {
      this.socket.off(eventName, handler);
    }

    if (this.eventHandlers.has(eventName)) {
      this.eventHandlers.get(eventName).delete(handler);
    }
  }

  // Emit event
  emit(eventName, data) {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn(`Cannot emit ${eventName}: Socket not connected`);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected && this.socket?.connected;
  }

  // Chat-specific methods
  joinChat(username) {
    this.emit('join_chat', { username });
  }

  joinRoom(roomName, username) {
    this.emit('join_room', { roomName, username });
  }

  startPrivateChat(targetUser, currentUser) {
    this.emit('start_private_chat', { targetUser, currentUser });
  }

  sendGroupMessage(roomName, message, username) {
    this.emit('group_message', { roomName, message, username });
  }

  sendPrivateMessage(chatId, message, sender, receiver) {
    this.emit('private_message', { chatId, message, sender, receiver });
  }

  createGroup(groupName, creator) {
    this.emit('create_group', { groupName, creator });
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;