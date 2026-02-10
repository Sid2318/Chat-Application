import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import LoginForm from "./components/LoginForm";

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentChat, setCurrentChat] = useState(null); // { type: 'private'|'group', name: '', chatId: '' }
  const [messages, setMessages] = useState({});
  const [activeChats, setActiveChats] = useState([]);

  useEffect(() => {
    if (username) {
      const newSocket = io("http://localhost:3001");
      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnected(true);
        console.log("Connected to server");
        newSocket.emit("join_chat", { username });
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Disconnected from server");
      });

      // Handle user list updates
      newSocket.on("users_updated", (userList) => {
        setUsers(userList.filter((user) => user !== username));
      });

      // Handle room list updates
      newSocket.on("rooms_updated", (roomList) => {
        setRooms(roomList);
      });

      // Handle private chat started
      newSocket.on("private_chat_started", (data) => {
        const { chatId, targetUser } = data;
        const newChat = {
          id: chatId,
          type: "private",
          name: targetUser,
          participants: [username, targetUser],
        };

        setActiveChats((prev) => {
          const exists = prev.find((chat) => chat.id === chatId);
          if (!exists) {
            return [...prev, newChat];
          }
          return prev;
        });

        setCurrentChat(newChat);
      });

      // Handle private messages
      newSocket.on("private_message", (messageData) => {
        const { chatId } = messageData;
        setMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), messageData],
        }));
      });

      // Handle group messages
      newSocket.on("group_message", (messageData) => {
        const { roomName } = messageData;
        setMessages((prev) => ({
          ...prev,
          [roomName]: [...(prev[roomName] || []), messageData],
        }));
      });

      // Handle user joined room
      newSocket.on("user_joined_room", (data) => {
        const { roomName } = data;
        setMessages((prev) => ({
          ...prev,
          [roomName]: [...(prev[roomName] || []), { ...data, type: "system" }],
        }));
      });

      // Handle user left room
      newSocket.on("user_left_room", (data) => {
        const { roomName } = data;
        setMessages((prev) => ({
          ...prev,
          [roomName]: [...(prev[roomName] || []), { ...data, type: "system" }],
        }));
      });

      // Handle group created
      newSocket.on("group_created", (data) => {
        const { groupName } = data;
        const newChat = {
          id: groupName,
          type: "group",
          name: groupName,
          participants: [username],
        };

        setActiveChats((prev) => [...prev, newChat]);
        setCurrentChat(newChat);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [username]);

  const handleLogin = (enteredUsername) => {
    setUsername(enteredUsername);
  };

  const startPrivateChat = (targetUser) => {
    if (socket && targetUser !== username) {
      socket.emit("start_private_chat", {
        targetUser,
        currentUser: username,
      });
    }
  };

  const joinRoom = (roomName) => {
    if (socket) {
      socket.emit("join_room", { roomName, username });
      const newChat = {
        id: roomName,
        type: "group",
        name: roomName,
        participants: [],
      };

      setActiveChats((prev) => {
        const exists = prev.find((chat) => chat.id === roomName);
        if (!exists) {
          return [...prev, newChat];
        }
        return prev;
      });

      setCurrentChat(newChat);
    }
  };

  const createGroup = (groupName) => {
    if (socket && groupName.trim()) {
      socket.emit("create_group", {
        groupName: groupName.trim(),
        creator: username,
      });
    }
  };

  const sendMessage = (message) => {
    if (!socket || !currentChat || !message.trim()) return;

    if (currentChat.type === "private") {
      socket.emit("private_message", {
        chatId: currentChat.id,
        message: message.trim(),
        sender: username,
        receiver: currentChat.name,
      });
    } else if (currentChat.type === "group") {
      socket.emit("group_message", {
        roomName: currentChat.name,
        message: message.trim(),
        username,
      });
    }
  };

  if (!username) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>WhatsApp Clone</h1>
        <div className="user-info">
          <span>Welcome, {username}</span>
          <span className={`status ${isConnected ? "online" : "offline"}`}>
            {isConnected ? "🟢 Online" : "🔴 Offline"}
          </span>
        </div>
      </div>

      <div className="chat-layout">
        <ChatSidebar
          users={users}
          rooms={rooms}
          activeChats={activeChats}
          currentChat={currentChat}
          onSelectChat={setCurrentChat}
          onStartPrivateChat={startPrivateChat}
          onJoinRoom={joinRoom}
          onCreateGroup={createGroup}
        />

        <ChatWindow
          currentChat={currentChat}
          messages={messages[currentChat?.id] || []}
          onSendMessage={sendMessage}
          currentUser={username}
        />
      </div>
    </div>
  );
}

export default App;
