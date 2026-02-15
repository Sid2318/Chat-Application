// Helper utility functions

class ChatHelpers {
  // Generate unique private chat ID
  static generatePrivateChatId(user1, user2) {
    return [user1, user2].sort().join('_');
  }

  // Generate unique message ID
  static generateMessageId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Validate username
  static isValidUsername(username) {
    return username && 
           typeof username === 'string' && 
           username.trim().length >= 2 && 
           username.trim().length <= 20 &&
           /^[a-zA-Z0-9_]+$/.test(username.trim());
  }

  // Validate group name
  static isValidGroupName(groupName) {
    return groupName && 
           typeof groupName === 'string' && 
           groupName.trim().length >= 2 && 
           groupName.trim().length <= 30;
  }

  // Format timestamp
  static formatTimestamp() {
    return new Date().toLocaleTimeString();
  }

  // Sanitize message content
  static sanitizeMessage(message) {
    if (typeof message !== 'string') return '';
    return message.trim().slice(0, 1000); // Max 1000 characters
  }
}

module.exports = ChatHelpers;