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

app.get("/", (req, res) => {
  res.send("Chat Server Running!");
});

//Turn on the socket
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle chat message
  socket.on("chat_message", (data) => {
    console.log("Message received:", data);
    // Broadcast message to all connected clients
    io.emit("chat_message", {
      id: Date.now(),
      user: data.user,
      message: data.message,
      timestamp: new Date().toLocaleTimeString(),
    });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server is running on port http://localhost:3000");
});
