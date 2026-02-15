class Chat {
  constructor(id, type, name, participants = []) {
    this.id = id;
    this.type = type; // 'private' or 'group'
    this.name = name;
    this.participants = participants;
    this.messages = [];
    this.createdAt = new Date();
    this.lastActivity = new Date();
  }

  addMessage(message) {
    this.messages.push(message);
    this.lastActivity = new Date();
  }

  addParticipant(username) {
    if (!this.participants.includes(username)) {
      this.participants.push(username);
    }
  }

  removeParticipant(username) {
    this.participants = this.participants.filter(p => p !== username);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      participants: this.participants,
      messageCount: this.messages.length,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity
    };
  }
}

module.exports = Chat;