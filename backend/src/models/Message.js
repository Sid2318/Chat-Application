class Message {
  constructor(id, user, message, type, chatId, metadata = {}) {
    this.id = id || Date.now();
    this.user = user;
    this.message = message;
    this.type = type; // 'private', 'group', 'system'
    this.chatId = chatId;
    this.timestamp = new Date().toLocaleTimeString();
    this.createdAt = new Date();
    this.metadata = metadata; // Additional data like receivers, etc.
  }

  toJSON() {
    return {
      id: this.id,
      user: this.user,
      message: this.message,
      type: this.type,
      chatId: this.chatId,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      ...this.metadata
    };
  }
}

module.exports = Message;