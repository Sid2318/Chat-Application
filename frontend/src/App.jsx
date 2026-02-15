import { useEffect } from "react";
import "./App.css";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import LoginForm from "./components/LoginForm";
import { ChatProvider, useChat } from "./context/ChatContext";
import { useOnlineStatus } from "./hooks";

// Main Chat Application Component
const ChatApp = () => {
  const { state, actions } = useChat();
  const isOnline = useOnlineStatus();
  
  const {
    user,
    isAuthenticated,
    isConnected,
    users,
    rooms,
    currentChat,
    activeChats,
    messages,
    error
  } = state;

  // Handle login
  const handleLogin = (username) => {
    actions.loginUser(username);
  };

  // Handle logout
  const handleLogout = () => {
    actions.logoutUser();
  };

  // Clear errors after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        actions.clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, actions]);

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginForm onLogin={handleLogin} error={error} />;
  }

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>WhatsApp Clone</h1>
        <div className="user-info">
          <span>Welcome, {user.username}</span>
          <span className={`status ${isConnected && isOnline ? "online" : "offline"}`}>
            {isConnected && isOnline ? "🟢 Online" : "🔴 Offline"}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={actions.clearError}>✕</button>
        </div>
      )}
      
      <div className="chat-layout">
        <ChatSidebar
          users={users}
          rooms={rooms}
          activeChats={activeChats}
          currentChat={currentChat}
          onSelectChat={actions.setCurrentChat}
          onStartPrivateChat={actions.startPrivateChat}
          onJoinRoom={actions.joinRoom}
          onCreateGroup={actions.createGroup}
        />
        
        <ChatWindow
          currentChat={currentChat}
          messages={messages[currentChat?.id] || []}
          onSendMessage={actions.sendMessage}
          currentUser={user.username}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
};

// Root App Component with Provider
const App = () => {
  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  );
};

export default App;
