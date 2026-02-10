const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store active users and chat rooms
const connectedUsers = new Map();
const chatRooms = new Map();
const privateChats = new Map();

app.get("/", (req, res) => {
  res.send("Chat Server Running!");
});

// Helper function to generate private chat room ID
const getPrivateChatId = (user1, user2) => {
  return [user1, user2].sort().join("_");
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining with username
  socket.on("join_chat", (userData) => {
    const { username } = userData;
    connectedUsers.set(socket.id, username);
    socket.username = username;

    console.log(`${username} joined the chat`);

    // Send updated user list to all clients
    const userList = Array.from(connectedUsers.values());
    io.emit("users_updated", userList);

    // Send existing chat rooms to the new user
    const roomList = Array.from(chatRooms.keys());
    socket.emit("rooms_updated", roomList);
  });

  // Handle joining specific rooms (for group chats)
  socket.on("join_room", (roomData) => {
    const { roomName, username } = roomData;
    socket.join(roomName);

    if (!chatRooms.has(roomName)) {
      chatRooms.set(roomName, new Set());
    }
    chatRooms.get(roomName).add(username);

    console.log(`${username} joined room: ${roomName}`);

    // Notify room members
    socket.to(roomName).emit("user_joined_room", {
      roomName,
      username,
      message: `${username} joined the room`,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Send updated room list to all clients
    const roomList = Array.from(chatRooms.keys());
    io.emit("rooms_updated", roomList);
  });

  // Handle private chat initiation
  socket.on("start_private_chat", (data) => {
    const { targetUser, currentUser } = data;
    const chatId = getPrivateChatId(currentUser, targetUser);

    socket.join(chatId);

    // Find target user's socket and join them to the room
    for (const [socketId, username] of connectedUsers.entries()) {
      if (username === targetUser) {
        const targetSocket = io.sockets.sockets.get(socketId);
        if (targetSocket) {
          targetSocket.join(chatId);
        }
        break;
      }
    }

    if (!privateChats.has(chatId)) {
      privateChats.set(chatId, {
        users: [currentUser, targetUser],
        messages: [],
      });
    }

    console.log(
      `Private chat started between ${currentUser} and ${targetUser}`,
    );

    // Send chat ID back to the client
    socket.emit("private_chat_started", { chatId, targetUser });
  });

  // Handle group chat messages
  socket.on("group_message", (data) => {
    const { roomName, message, username } = data;

    const messageData = {
      id: Date.now(),
      user: username,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type: "group",
      roomName,
    };

    console.log(`Group message in ${roomName}:`, messageData);
    io.to(roomName).emit("group_message", messageData);
  });

  // Handle private messages
  socket.on("private_message", (data) => {
    const { chatId, message, sender, receiver } = data;

    const messageData = {
      id: Date.now(),
      user: sender,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type: "private",
      chatId,
      receiver,
    };

    console.log(`Private message from ${sender} to ${receiver}:`, messageData);

    // Store message in private chat
    if (privateChats.has(chatId)) {
      privateChats.get(chatId).messages.push(messageData);
    }

    // Send to both users in the private chat
    io.to(chatId).emit("private_message", messageData);
  });

  // Handle creating new group chat
  socket.on("create_group", (data) => {
    const { groupName, creator } = data;

    if (!chatRooms.has(groupName)) {
      chatRooms.set(groupName, new Set([creator]));
      socket.join(groupName);

      console.log(`${creator} created group: ${groupName}`);

      // Send updated room list to all clients
      const roomList = Array.from(chatRooms.keys());
      io.emit("rooms_updated", roomList);

      socket.emit("group_created", { groupName });
    } else {
      socket.emit("group_creation_error", {
        error: "Group name already exists",
      });
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const username = connectedUsers.get(socket.id);
    if (username) {
      console.log(`${username} disconnected`);
      connectedUsers.delete(socket.id);

      // Update user list for all clients
      const userList = Array.from(connectedUsers.values());
      io.emit("users_updated", userList);

      // Remove user from all chat rooms
      for (const [roomName, members] of chatRooms.entries()) {
        if (members.has(username)) {
          members.delete(username);
          socket.to(roomName).emit("user_left_room", {
            roomName,
            username,
            message: `${username} left the room`,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      }
    }
  });
});

server.listen(3001, () => {
  console.log("Server is running on port http://localhost:3001");
});
