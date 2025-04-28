import { io, Socket } from 'socket.io-client';

// Get the API URL from the environment variables, remove '/api' if present
const API_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';

let socket: Socket | null = null;

// Function to initialize socket connection
export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server with id:', socket?.id);
      // Join the admin dashboard room
      if (socket) {
        socket.emit('join_admin_dashboard');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
    });
  }

  return socket;
};

// Function to get the socket instance
export const getSocket = (): Socket | null => {
  return socket;
};

// Function to disconnect the socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected manually');
  }
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
}; 