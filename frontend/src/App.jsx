import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    newSocket.on("chat_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && username.trim() && socket) {
      socket.emit("chat_message", {
        user: username,
        message: messageInput,
      });
      setMessageInput("");
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>Simple Chat App</h1>
        <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      </div>

      {!username ? (
        <div className="username-form">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && setUsername(username)}
          />
          <button onClick={() => setUsername(username)}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className="message">
                <span className="username">{msg.user}:</span>
                <span className="text">{msg.message}</span>
                <span className="time">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
