import { createContext, useContext, useReducer, useEffect } from 'react';
import socketService from '../services/socketService';

// Initial state
const initialState = {
  // User state
  user: null,
  isAuthenticated: false,
  
  // Connection state
  isConnected: false,
  connectionError: null,
  
  // Users and rooms
  users: [],
  rooms: [],
  
  // Chat state
  currentChat: null,
  activeChats: [],
  messages: {},
  
  // UI state
  loading: false,
  error: null
};

// Action types
const ActionTypes = {
  // User actions
  SET_USER: 'SET_USER',
  LOGOUT_USER: 'LOGOUT_USER',
  
  // Connection actions
  SET_CONNECTED: 'SET_CONNECTED',
  SET_CONNECTION_ERROR: 'SET_CONNECTION_ERROR',
  
  // Users and rooms
  UPDATE_USERS: 'UPDATE_USERS',
  UPDATE_ROOMS: 'UPDATE_ROOMS',
  
  // Chat actions
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  ADD_ACTIVE_CHAT: 'ADD_ACTIVE_CHAT',
  UPDATE_ACTIVE_CHATS: 'UPDATE_ACTIVE_CHATS',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  
  // UI actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
      
    case ActionTypes.LOGOUT_USER:
      return {
        ...initialState
      };
      
    case ActionTypes.SET_CONNECTED:
      return {
        ...state,
        isConnected: action.payload,
        connectionError: action.payload ? null : state.connectionError
      };
      
    case ActionTypes.SET_CONNECTION_ERROR:
      return {
        ...state,
        connectionError: action.payload,
        isConnected: false
      };
      
    case ActionTypes.UPDATE_USERS:
      return {
        ...state,
        users: action.payload
      };
      
    case ActionTypes.UPDATE_ROOMS:
      return {
        ...state,
        rooms: action.payload
      };
      
    case ActionTypes.SET_CURRENT_CHAT:
      return {
        ...state,
        currentChat: action.payload
      };
      
    case ActionTypes.ADD_ACTIVE_CHAT:
      const existingChat = state.activeChats.find(chat => chat.id === action.payload.id);
      if (existingChat) {
        return state;
      }
      return {
        ...state,
        activeChats: [...state.activeChats, action.payload]
      };
      
    case ActionTypes.UPDATE_ACTIVE_CHATS:
      return {
        ...state,
        activeChats: action.payload
      };
      
    case ActionTypes.ADD_MESSAGE:
      const { chatId, message } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), message]
        }
      };
      
    case ActionTypes.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Setup socket event listeners
  useEffect(() => {
    // Connection status
    socketService.on('connection_status_changed', ({ isConnected }) => {
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: isConnected });
    });

    socketService.on('connection_error', ({ error }) => {
      dispatch({ type: ActionTypes.SET_CONNECTION_ERROR, payload: error.message });
    });

    // User and room updates
    socketService.on('users_updated', (userList) => {
      const filteredUsers = userList.filter(user => user !== state.user?.username);
      dispatch({ type: ActionTypes.UPDATE_USERS, payload: filteredUsers });
    });

    socketService.on('rooms_updated', (roomList) => {
      dispatch({ type: ActionTypes.UPDATE_ROOMS, payload: roomList });
    });

    // Chat events
    socketService.on('private_chat_started', (data) => {
      const { chatId, targetUser, chat } = data;
      const newChat = {
        id: chatId,
        type: 'private',
        name: targetUser,
        participants: [state.user?.username, targetUser]
      };
      
      dispatch({ type: ActionTypes.ADD_ACTIVE_CHAT, payload: newChat });
      dispatch({ type: ActionTypes.SET_CURRENT_CHAT, payload: newChat });
    });

    socketService.on('group_created', (data) => {
      const { groupName, chat } = data;
      const newChat = {
        id: groupName,
        type: 'group',
        name: groupName,
        participants: [state.user?.username]
      };
      
      dispatch({ type: ActionTypes.ADD_ACTIVE_CHAT, payload: newChat });
      dispatch({ type: ActionTypes.SET_CURRENT_CHAT, payload: newChat });
    });

    // Message events
    socketService.on('private_message', (messageData) => {
      dispatch({
        type: ActionTypes.ADD_MESSAGE,
        payload: {
          chatId: messageData.chatId,
          message: messageData
        }
      });
    });

    socketService.on('group_message', (messageData) => {
      dispatch({
        type: ActionTypes.ADD_MESSAGE,
        payload: {
          chatId: messageData.roomName || messageData.chatId,
          message: messageData
        }
      });
    });

    socketService.on('user_joined_room', (data) => {
      dispatch({
        type: ActionTypes.ADD_MESSAGE,
        payload: {
          chatId: data.roomName,
          message: { ...data, type: 'system' }
        }
      });
    });

    socketService.on('user_left_room', (data) => {
      dispatch({
        type: ActionTypes.ADD_MESSAGE,
        payload: {
          chatId: data.roomName,
          message: { ...data, type: 'system' }
        }
      });
    });

    // Error handling
    socketService.on('join_error', ({ error }) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    });

    socketService.on('join_room_error', ({ error }) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    });

    socketService.on('private_chat_error', ({ error }) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    });

    socketService.on('message_error', ({ error }) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    });

    socketService.on('group_creation_error', ({ error }) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    });

    // Cleanup function
    return () => {
      // Remove all listeners when component unmounts
      socketService.disconnect();
    };
  }, [state.user?.username]);

  // Action creators
  const actions = {
    // User actions
    loginUser: (username) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.SET_USER, payload: { username } });
      
      // Connect to socket and join chat
      socketService.connect();
      socketService.joinChat(username);
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    },

    logoutUser: () => {
      socketService.disconnect();
      dispatch({ type: ActionTypes.LOGOUT_USER });
    },

    // Chat actions
    setCurrentChat: (chat) => {
      dispatch({ type: ActionTypes.SET_CURRENT_CHAT, payload: chat });
    },

    startPrivateChat: (targetUser) => {
      if (state.user && targetUser !== state.user.username) {
        socketService.startPrivateChat(targetUser, state.user.username);
      }
    },

    joinRoom: (roomName) => {
      if (state.user) {
        socketService.joinRoom(roomName, state.user.username);
        const newChat = {
          id: roomName,
          type: 'group',
          name: roomName,
          participants: []
        };
        
        dispatch({ type: ActionTypes.ADD_ACTIVE_CHAT, payload: newChat });
        dispatch({ type: ActionTypes.SET_CURRENT_CHAT, payload: newChat });
      }
    },

    createGroup: (groupName) => {
      if (state.user && groupName.trim()) {
        socketService.createGroup(groupName.trim(), state.user.username);
      }
    },

    sendMessage: (message) => {
      if (!state.currentChat || !state.user || !message.trim()) return;

      if (state.currentChat.type === 'private') {
        socketService.sendPrivateMessage(
          state.currentChat.id,
          message.trim(),
          state.user.username,
          state.currentChat.name
        );
      } else if (state.currentChat.type === 'group') {
        socketService.sendGroupMessage(
          state.currentChat.name,
          message.trim(),
          state.user.username
        );
      }
    },

    // Utility actions
    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }
  };

  return (
    <ChatContext.Provider value={{ state, actions }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export { ActionTypes };