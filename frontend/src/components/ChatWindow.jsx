import { useState, useEffect, useRef } from "react";
import { useForm } from "../hooks";
import { chatUtils, validators } from "../utils";

const ChatWindow = ({ currentChat, messages, onSendMessage, currentUser, isConnected }) => {
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const {
    values,
    errors,
    setValue,
    validate,
    reset
  } = useForm(
    { message: '' },
    { message: validators.message }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate() || !isConnected) {
      return;
    }

    const message = values.message.trim();
    if (message) {
      onSendMessage(message);
      reset();
    }
  };

  const handleMessageChange = (e) => {
    setValue('message', e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderMessage = (message, index) => {
    const isOwnMessage = message.user === currentUser;
    const isSystemMessage = message.type === 'system';
    const messageKey = message.id || `${index}-${message.timestamp}`;

    if (isSystemMessage) {
      return (
        <div key={messageKey} className="system-message">
          <span>{message.message}</span>
          <span className="time">{chatUtils.formatTimestamp(message.timestamp)}</span>
        </div>
      );
    }

    return (
      <div 
        key={messageKey} 
        className={`message ${isOwnMessage ? "own-message" : "other-message"}`}
      >
        <div className="message-content">
          {!isOwnMessage && (
            <div className="message-sender">{message.user}</div>
          )}
          <div className="message-text">{message.message}</div>
          <div className="message-time">
            {chatUtils.formatTimestamp(message.timestamp)}
            {isOwnMessage && (
              <span className="message-status">
                ✓
              </span>
            )}
          </div>
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
