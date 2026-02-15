class User {
  constructor(socketId, username) {
    this.socketId = socketId;
    this.username = username;
    this.connectedAt = new Date();
    this.isOnline = true;
  }

  toJSON() {
    return {
      socketId: this.socketId,
      username: this.username,
      connectedAt: this.connectedAt,
      isOnline: this.isOnline
    };
  }
}

module.exports = User;