const Chat = require('../models/Chat');
const Message = require('../models/Message');
const ChatHelpers = require('../utils/helpers');

class ChatService {
  constructor() {
    this.chats = new Map(); // chatId -> Chat
    this.groupChats = new Map(); // groupName -> Chat
    this.privateChats = new Map(); // chatId -> Chat
  }

  // Create a private chat
  createPrivateChat(user1, user2) {
    const chatId = ChatHelpers.generatePrivateChatId(user1, user2);
    
    if (!this.privateChats.has(chatId)) {
      const chat = new Chat(chatId, 'private', `${user1}, ${user2}`, [user1, user2]);
      this.privateChats.set(chatId, chat);
      this.chats.set(chatId, chat);
    }
    
    return this.privateChats.get(chatId);
  }

  // Create a group chat
  createGroupChat(groupName, creator) {
    if (!ChatHelpers.isValidGroupName(groupName)) {
      throw new Error('Invalid group name');
    }

    if (this.groupChats.has(groupName)) {
      throw new Error('Group name already exists');
    }

    const chat = new Chat(groupName, 'group', groupName, [creator]);
    this.groupChats.set(groupName, chat);
    this.chats.set(groupName, chat);
    
    return chat;
  }

  // Get chat by ID
  getChat(chatId) {
    return this.chats.get(chatId);
  }

  // Get private chat
  getPrivateChat(user1, user2) {
    const chatId = ChatHelpers.generatePrivateChatId(user1, user2);
    return this.privateChats.get(chatId);
  }

  // Get group chat
  getGroupChat(groupName) {
    return this.groupChats.get(groupName);
  }

  // Add message to chat
  addMessage(chatId, user, messageText, type = 'group') {
    const chat = this.getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const sanitizedMessage = ChatHelpers.sanitizeMessage(messageText);
    if (!sanitizedMessage) {
      throw new Error('Invalid message');
    }

    const messageId = ChatHelpers.generateMessageId();
    const message = new Message(messageId, user, sanitizedMessage, type, chatId);
    
    chat.addMessage(message);
    return message;
  }

  // Add user to group chat
  addUserToGroup(groupName, username) {
    const chat = this.groupChats.get(groupName);
    if (!chat) {
      throw new Error('Group not found');
    }

    chat.addParticipant(username);
    return chat;
  }

  // Remove user from group chat
  removeUserFromGroup(groupName, username) {
    const chat = this.groupChats.get(groupName);
    if (chat) {
      chat.removeParticipant(username);
      return chat;
    }
    return null;
  }

  // Get all group chat names
  getGroupChatNames() {
    return Array.from(this.groupChats.keys());
  }

  // Get chat messages
  getChatMessages(chatId, limit = 50) {
    const chat = this.getChat(chatId);
    if (!chat) {
      return [];
    }

    return chat.messages.slice(-limit).map(msg => msg.toJSON());
  }

  // Create system message
  createSystemMessage(chatId, messageText) {
    const messageId = ChatHelpers.generateMessageId();
    const message = new Message(messageId, 'System', messageText, 'system', chatId);
    
    const chat = this.getChat(chatId);
    if (chat) {
      chat.addMessage(message);
    }
    
    return message;
  }

  // Get user's active chats
  getUserChats(username) {
    const userChats = [];
    
    for (const [chatId, chat] of this.chats.entries()) {
      if (chat.participants.includes(username)) {
        userChats.push(chat.toJSON());
      }
    }
    
    return userChats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }
}

module.exports = ChatService;