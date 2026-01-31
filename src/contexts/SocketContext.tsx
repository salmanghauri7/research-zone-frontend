"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socketApi, setSocketApi] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const token = localStorage.getItem("access_token");
  useEffect(() => {
    // 1. Initialize the persistent instance in the Ref
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000", {
        withCredentials: true,
        autoConnect: true,
        auth: {
          token,
        },
      });
    }

    const socket = socketRef.current;

    // 2. Safely set the state so children can access it during render
    setSocketApi(socket);

    // 3. Status Listeners
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // 4. Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // We don't necessarily disconnect here if you want it to persist
      // across internal Next.js navigations, but for logout/unmount, you should.
    };
  }, [token]);

  // Now we pass 'socketApi' (state) instead of 'socketRef.current' (ref)
  return (
    <SocketContext.Provider value={{ socket: socketApi, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
