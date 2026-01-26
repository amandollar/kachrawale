import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is logged in
    if (user) {
      // Create connection
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
        // Pass token if your socket auth middleware requires it, 
        // purely relying on simple connection for now
      });

      setSocket(newSocket);

      // Cleanup on unmount or user change
      return () => {
        newSocket.disconnect();
      };
    } else {
       if (socket) {
           socket.disconnect();
           setSocket(null);
       }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
