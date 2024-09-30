import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:5600"); // Your backend URL
    console.log("Socket initialized", newSocket);

    // Add socket connection event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setSocket(newSocket); // Set the socket once it's connected
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    // Clean up when the component is unmounted
    return () => {
      newSocket.close();
    };
  }, []); // Empty dependency array to ensure socket is created only once

  // Prevent rendering children until socket is initialized
  if (!socket) {
    return <div>Loading socket...</div>;
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
