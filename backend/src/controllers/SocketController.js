class SocketController {
  constructor(io, userService, chatService) {
    this.io = io;
    this.userService = userService;
    this.chatService = chatService;
  }

  onConnection(socket) {
    console.log('User connected:', socket.id);
    this.setupEventListeners(socket);
  }

  setupEventListeners(socket) {
    socket.on('join_chat', (data) => this.handleJoinChat(socket, data));
    socket.on('join_room', (data) => this.handleJoinRoom(socket, data));
    socket.on('start_private_chat', (data) => this.handleStartPrivateChat(socket, data));
    socket.on('group_message', (data) => this.handleGroupMessage(socket, data));
    socket.on('private_message', (data) => this.handlePrivateMessage(socket, data));
    socket.on('create_group', (data) => this.handleCreateGroup(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  handleJoinChat(socket, data) {
    try {
      const { username } = data;
      const user = this.userService.addUser(socket.id, username);
      socket.username = username;
      console.log(`${username} joined the chat`);
      this.broadcastUserList();
      this.sendRoomList(socket);
    } catch (error) {
      socket.emit('join_error', { error: error.message });
    }
  }

  handleJoinRoom(socket, data) {
    try {
      const { roomName, username } = data;
      if (!this.userService.userExists(username)) {
        throw new Error('User not found');
      }
      socket.join(roomName);
      let chat = this.chatService.getGroupChat(roomName);
      if (!chat) {
        chat = this.chatService.createGroupChat(roomName, username);
      } else {
        this.chatService.addUserToGroup(roomName, username);
      }
      console.log(`${username} joined room: ${roomName}`);
      const systemMessage = this.chatService.createSystemMessage(roomName, `${username} joined the room`);
      socket.to(roomName).emit('user_joined_room', systemMessage.toJSON());
      this.broadcastRoomList();
    } catch (error) {
      socket.emit('join_room_error', { error: error.message });
    }
  }

  handleStartPrivateChat(socket, data) {
    try {
      const { targetUser, currentUser } = data;
      if (!this.userService.userExists(currentUser) || !this.userService.userExists(targetUser)) {
        throw new Error('User not found');
      }
      const chat = this.chatService.createPrivateChat(currentUser, targetUser);
      const chatId = chat.id;
      socket.join(chatId);
      const targetSocketId = this.userService.getSocketIdByUsername(targetUser);
      if (targetSocketId) {
        const targetSocket = this.io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.join(chatId);
        }
      }
      console.log(`Private chat started between ${currentUser} and ${targetUser}`);
      socket.emit('private_chat_started', { chatId, targetUser, chat: chat.toJSON() });
    } catch (error) {
      socket.emit('private_chat_error', { error: error.message });
    }
  }

  handleGroupMessage(socket, data) {
    try {
      const { roomName, message, username } = data;
      const messageObj = this.chatService.addMessage(roomName, username, message, 'group');
      console.log(`Group message in ${roomName}:`, messageObj.toJSON());
      this.io.to(roomName).emit('group_message', messageObj.toJSON());
    } catch (error) {
      socket.emit('message_error', { error: error.message });
    }
  }

  handlePrivateMessage(socket, data) {
    try {
      const { chatId, message, sender, receiver } = data;
      const messageObj = this.chatService.addMessage(chatId, sender, message, 'private');
      console.log(`Private message from ${sender} to ${receiver}:`, messageObj.toJSON());
      this.io.to(chatId).emit('private_message', messageObj.toJSON());
    } catch (error) {
      socket.emit('message_error', { error: error.message });
    }
  }

  handleCreateGroup(socket, data) {
    try {
      const { groupName, creator } = data;
      const chat = this.chatService.createGroupChat(groupName, creator);
      socket.join(groupName);
      console.log(`${creator} created group: ${groupName}`);
      this.broadcastRoomList();
      socket.emit('group_created', { groupName, chat: chat.toJSON() });
    } catch (error) {
      socket.emit('group_creation_error', { error: error.message });
    }
  }

  handleDisconnect(socket) {
    const user = this.userService.removeUser(socket.id);
    if (user) {
      const { username } = user;
      console.log(`${username} disconnected`);
      this.broadcastUserList();
      this.handleUserLeaveAllGroups(socket, username);
    }
  }

  handleUserLeaveAllGroups(socket, username) {
    const groupNames = this.chatService.getGroupChatNames();
    for (const groupName of groupNames) {
      const chat = this.chatService.getGroupChat(groupName);
      if (chat && chat.participants.includes(username)) {
        this.chatService.removeUserFromGroup(groupName, username);
        const systemMessage = this.chatService.createSystemMessage(groupName, `${username} left the room`);
        socket.to(groupName).emit('user_left_room', systemMessage.toJSON());
      }
    }
  }

  broadcastUserList() {
    const usernames = this.userService.getUsernames();
    this.io.emit('users_updated', usernames);
  }

  sendRoomList(socket) {
    const roomNames = this.chatService.getGroupChatNames();
    socket.emit('rooms_updated', roomNames);
  }

  broadcastRoomList() {
    const roomNames = this.chatService.getGroupChatNames();
    this.io.emit('rooms_updated', roomNames);
  }
}

module.exports = SocketController;