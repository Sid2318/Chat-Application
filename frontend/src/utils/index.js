// Utility functions for the chat application

export const chatUtils = {
  // Format timestamp to readable format
  formatTimestamp: (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date();
    const messageDate = new Date(timestamp);
    const isToday = date.toDateString() === messageDate.toDateString();
    
    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  },

  // Generate unique ID for messages
  generateMessageId: () => {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Validate username
  isValidUsername: (username) => {
    if (!username || typeof username !== 'string') return false;
    const trimmed = username.trim();
    return trimmed.length >= 2 && 
           trimmed.length <= 20 && 
           /^[a-zA-Z0-9_]+$/.test(trimmed);
  },

  // Validate group name
  isValidGroupName: (groupName) => {
    if (!groupName || typeof groupName !== 'string') return false;
    const trimmed = groupName.trim();
    return trimmed.length >= 2 && trimmed.length <= 30;
  },

  // Sanitize message content
  sanitizeMessage: (message) => {
    if (typeof message !== 'string') return '';
    return message.trim().slice(0, 1000);
  },

  // Generate private chat ID
  generatePrivateChatId: (user1, user2) => {
    return [user1, user2].sort().join('_');
  },

  // Get chat display name
  getChatDisplayName: (chat, currentUser) => {
    if (!chat) return '';
    
    if (chat.type === 'private') {
      return chat.participants?.find(p => p !== currentUser) || chat.name;
    }
    
    return chat.name;
  },

  // Get chat avatar/emoji
  getChatAvatar: (chat) => {
    if (!chat) return '💬';
    return chat.type === 'private' ? '👤' : '👥';
  },

  // Sort chats by last activity
  sortChatsByActivity: (chats) => {
    return chats.sort((a, b) => {
      const aTime = new Date(a.lastActivity || a.createdAt || 0);
      const bTime = new Date(b.lastActivity || b.createdAt || 0);
      return bTime - aTime;
    });
  },

  // Filter and search messages
  filterMessages: (messages, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return messages;
    
    const term = searchTerm.toLowerCase();
    return messages.filter(message => 
      message.message?.toLowerCase().includes(term) ||
      message.user?.toLowerCase().includes(term)
    );
  },

  // Group messages by date
  groupMessagesByDate: (messages) => {
    const grouped = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt || message.timestamp);
      const dateKey = date.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    
    return grouped;
  },

  // Check if user is typing (for future implementation)
  isUserTyping: (typingUsers, currentUser) => {
    return typingUsers.filter(user => user !== currentUser);
  },

  // Format user status
  formatUserStatus: (user) => {
    if (!user) return 'Offline';
    
    if (user.isOnline) {
      const lastSeen = new Date(user.connectedAt);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Online';
      if (diffMinutes < 5) return 'Just now';
      return 'Online';
    }
    
    return 'Offline';
  }
};

// Validation utilities
export const validators = {
  username: {
    required: true,
    minLength: 2,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 2-20 characters, alphanumeric and underscores only'
  },

  groupName: {
    required: true,
    minLength: 2,
    maxLength: 30,
    message: 'Group name must be 2-30 characters'
  },

  message: {
    required: true,
    minLength: 1,
    maxLength: 1000,
    message: 'Message cannot be empty and must be less than 1000 characters'
  }
};

// Constants
export const constants = {
  // Event names
  SOCKET_EVENTS: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_CHAT: 'join_chat',
    JOIN_ROOM: 'join_room',
    START_PRIVATE_CHAT: 'start_private_chat',
    GROUP_MESSAGE: 'group_message',
    PRIVATE_MESSAGE: 'private_message',
    CREATE_GROUP: 'create_group',
    USERS_UPDATED: 'users_updated',
    ROOMS_UPDATED: 'rooms_updated'
  },

  // Chat types
  CHAT_TYPES: {
    PRIVATE: 'private',
    GROUP: 'group'
  },

  // Message types
  MESSAGE_TYPES: {
    TEXT: 'text',
    SYSTEM: 'system',
    IMAGE: 'image',
    FILE: 'file'
  },

  // UI constants
  UI: {
    MAX_MESSAGE_LENGTH: 1000,
    MAX_USERNAME_LENGTH: 20,
    MAX_GROUP_NAME_LENGTH: 30,
    TYPING_TIMEOUT: 3000,
    MESSAGE_LOAD_LIMIT: 50
  }
};

// Error handling utilities
export const errorUtils = {
  // Format error messages for display
  formatError: (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred';
  },

  // Check if error is network related
  isNetworkError: (error) => {
    const networkErrors = ['NETWORK_ERROR', 'CONNECTION_ERROR', 'TIMEOUT'];
    return networkErrors.some(type => 
      error?.type === type || 
      error?.message?.includes(type.toLowerCase())
    );
  }
};

// Default export with all utilities
const utils = {
  ...chatUtils,
  validators,
  constants,
  errorUtils
};

export default utils;