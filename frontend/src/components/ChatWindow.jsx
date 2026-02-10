import { useState, useEffect, useRef } from "react";

const ChatWindow = ({ currentChat, messages, onSendMessage, currentUser }) => {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  const formatTime = (timestamp) => {
    return timestamp || new Date().toLocaleTimeString();
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.user === currentUser;
    const isSystemMessage = message.type === "system";

    if (isSystemMessage) {
      return (
        <div key={message.id || Math.random()} className="system-message">
          <span>{message.message}</span>
          <span className="time">{formatTime(message.timestamp)}</span>
        </div>
      );
    }

    return (
      <div
        key={message.id || Math.random()}
        className={`message ${isOwnMessage ? "own-message" : "other-message"}`}
      >
        <div className="message-content">
          {!isOwnMessage && (
            <div className="message-sender">{message.user}</div>
          )}
          <div className="message-text">{message.message}</div>
          <div className="message-time">{formatTime(message.timestamp)}</div>
        </div>
      </div>
    );
  };

  if (!currentChat) {
    return (
      <div className="chat-window">
        <div className="empty-chat">
          <div className="empty-chat-content">
            <h3>Welcome to WhatsApp Clone</h3>
            <p>Select a chat from the sidebar to start messaging</p>
            <div className="features">
              <div className="feature">
                <span>💬</span>
                <span>Start private conversations</span>
              </div>
              <div className="feature">
                <span>👥</span>
                <span>Join group chats</span>
              </div>
              <div className="feature">
                <span>🚀</span>
                <span>Real-time messaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-avatar">
          {currentChat.type === "private" ? "👤" : "👥"}
        </div>
        <div className="chat-info">
          <div className="chat-name">{currentChat.name}</div>
          <div className="chat-status">
            {currentChat.type === "private" ? "Private Chat" : "Group Chat"}
            {currentChat.participants &&
              currentChat.participants.length > 0 && (
                <span> • {currentChat.participants.length} members</span>
              )}
          </div>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <div className="message-input-container">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message ${currentChat.name}...`}
            className="message-input"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!messageInput.trim()}
          >
            📤
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
