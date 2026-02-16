"use client";

import { config } from "@/config/config";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
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
    const token = localStorage.getItem("accessToken");

    console.log("🔌 SocketProvider: Initializing...");
    console.log("🔑 Token exists:", !!token);

    // Only initialize socket if user is authenticated
    if (!token) {
      console.log("❌ No token found, skipping socket initialization");
      return;
    }

    // Initialize the persistent instance in the Ref
    if (!socketRef.current) {
      console.log("✅ Creating socket connection to:", window.location.origin);
      socketRef.current = io(window.location.origin, {
        withCredentials: true,
        autoConnect: true,
        auth: {
          token,
        },
        path: "/socket.io", // Explicitly set Socket.IO path
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
    const onConnect = () => {
      console.log("🟢 Socket connected!");
      setIsConnected(true);
    };
    const onDisconnect = () => {
      console.log("🔴 Socket disconnected!");
      setIsConnected(false);
    };
    const onConnectError = (error: Error) => {
      console.error("❌ Socket connection error:", error);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
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
