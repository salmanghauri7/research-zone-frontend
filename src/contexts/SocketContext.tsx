"use client";

import { config } from "@/config/config";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
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
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Access localStorage only on the client
    const token = localStorage.getItem("access_token");

    // Only initialize socket if user is authenticated
    if (!token) return;

    // Initialize the persistent instance in the Ref
    if (!socketRef.current) {
      socketRef.current = io(config.LOCAL_SERVER_URL, {
        withCredentials: true,
        autoConnect: true,
        auth: {
          token,
        },
        // Optimize socket connection
        transports: ["websocket"], // Skip long-polling for faster connection
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
    }

    const socket = socketRef.current;

    // Safely set the state so children can access it during render
    setSocketApi(socket);

    // Status Listeners
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ socket: socketApi, isConnected }),
    [socketApi, isConnected],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
