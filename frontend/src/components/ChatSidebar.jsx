import { useState } from "react";

const ChatSidebar = ({
  users,
  rooms,
  activeChats,
  currentChat,
  onSelectChat,
  onStartPrivateChat,
  onJoinRoom,
  onCreateGroup,
}) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [activeTab, setActiveTab] = useState("chats");

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      onCreateGroup(groupName.trim());
      setGroupName("");
      setShowCreateGroup(false);
    }
  };

  const renderChatItem = (chat) => (
    <div
      key={chat.id}
      className={`chat-item ${currentChat?.id === chat.id ? "active" : ""}`}
      onClick={() => onSelectChat(chat)}
    >
      <div className="chat-avatar">{chat.type === "private" ? "👤" : "👥"}</div>
      <div className="chat-info">
        <div className="chat-name">{chat.name}</div>
        <div className="chat-type">
          {chat.type === "private" ? "Private Chat" : "Group Chat"}
        </div>
      </div>
    </div>
  );

  const renderUserItem = (user) => (
    <div
      key={user}
      className="user-item"
      onClick={() => onStartPrivateChat(user)}
    >
      <div className="user-avatar">👤</div>
      <div className="user-info">
        <div className="user-name">{user}</div>
        <div className="user-status">Online</div>
      </div>
      <div className="user-action">💬</div>
    </div>
  );

  const renderRoomItem = (room) => (
    <div key={room} className="room-item" onClick={() => onJoinRoom(room)}>
      <div className="room-avatar">👥</div>
      <div className="room-info">
        <div className="room-name">{room}</div>
        <div className="room-type">Group Chat</div>
      </div>
      <div className="room-action">🚪</div>
    </div>
  );

  return (
    <div className="chat-sidebar">
      <div className="sidebar-tabs">
        <button
          className={activeTab === "chats" ? "active" : ""}
          onClick={() => setActiveTab("chats")}
        >
          Chats
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={activeTab === "rooms" ? "active" : ""}
          onClick={() => setActiveTab("rooms")}
        >
          Rooms
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === "chats" && (
          <div className="chats-section">
            <div className="section-header">
              <h3>Your Chats</h3>
              <button
                className="create-group-btn"
                onClick={() => setShowCreateGroup(true)}
              >
                ➕
              </button>
            </div>

            {showCreateGroup && (
              <form onSubmit={handleCreateGroup} className="create-group-form">
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  autoFocus
                />
                <div className="form-actions">
                  <button type="submit">Create</button>
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="chat-list">
              {activeChats.length === 0 ? (
                <div className="empty-state">
                  <p>No chats yet. Start a conversation!</p>
                </div>
              ) : (
                activeChats.map(renderChatItem)
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-section">
            <div className="section-header">
              <h3>Online Users ({users.length})</h3>
            </div>
            <div className="user-list">
              {users.length === 0 ? (
                <div className="empty-state">
                  <p>No other users online</p>
                </div>
              ) : (
                users.map(renderUserItem)
              )}
            </div>
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="rooms-section">
            <div className="section-header">
              <h3>Available Rooms</h3>
            </div>
            <div className="room-list">
              {rooms.length === 0 ? (
                <div className="empty-state">
                  <p>No rooms available</p>
                </div>
              ) : (
                rooms.map(renderRoomItem)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
