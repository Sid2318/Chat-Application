const User = require('../models/User');
const ChatHelpers = require('../utils/helpers');

class UserService {
  constructor() {
    this.connectedUsers = new Map(); // socketId -> User
    this.usersByUsername = new Map(); // username -> socketId
  }

  // Add a new user
  addUser(socketId, username) {
    if (!ChatHelpers.isValidUsername(username)) {
      throw new Error('Invalid username');
    }

    // Check if username is already taken
    if (this.usersByUsername.has(username)) {
      throw new Error('Username already taken');
    }

    const user = new User(socketId, username);
    this.connectedUsers.set(socketId, user);
    this.usersByUsername.set(username, socketId);
    
    return user;
  }

  // Remove user by socket ID
  removeUser(socketId) {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.connectedUsers.delete(socketId);
      this.usersByUsername.delete(user.username);
      return user;
    }
    return null;
  }

  // Get user by socket ID
  getUserBySocketId(socketId) {
    return this.connectedUsers.get(socketId);
  }

  // Get user by username
  getUserByUsername(username) {
    const socketId = this.usersByUsername.get(username);
    return socketId ? this.connectedUsers.get(socketId) : null;
  }

  // Get all online users
  getAllUsers() {
    return Array.from(this.connectedUsers.values());
  }

  // Get usernames only (for frontend)
  getUsernames() {
    return Array.from(this.usersByUsername.keys());
  }

  // Check if user exists
  userExists(username) {
    return this.usersByUsername.has(username);
  }

  // Get user count
  getUserCount() {
    return this.connectedUsers.size;
  }

  // Get socket ID by username
  getSocketIdByUsername(username) {
    return this.usersByUsername.get(username);
  }
}

module.exports = UserService;