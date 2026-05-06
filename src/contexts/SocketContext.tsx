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
    console.log("🌐 Server URL:", config.SERVER_URL);

    // Only initialize socket if user is authenticated
    if (!token) {
      console.log("❌ No token found, skipping socket initialization");
      return;
    }

    // Initialize the persistent instance in the Ref
    if (!socketRef.current) {
      console.log("✅ Creating socket connection to:", config.SERVER_URL);

      try {
        socketRef.current = io(config.SERVER_URL, {
          withCredentials: true,
          autoConnect: true,
          auth: {
            token,
          },
          path: "/socket.io",
          transports: ["websocket", "polling"], // Allow fallback to polling
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          timeout: 20000, // Connection timeout
        });
      } catch (error) {
        console.error("❌ Failed to create socket instance:", error);
        return;
      }
    }

    const socket = socketRef.current;

    // Safely set the state so children can access it during render
    setSocketApi(socket);

    // Status Listeners
    const onConnect = () => {
      console.log("🟢 Socket connected successfully!");
      console.log("🆔 Socket ID:", socket.id);
      setIsConnected(true);
    };

    const onDisconnect = (reason: string) => {
      console.log("🔴 Socket disconnected! Reason:", reason);
      setIsConnected(false);
    };

    const onConnectError = (error: Error) => {
      console.error("❌ Socket connection error:", error);
      console.error("📝 Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      // Check if it's a connection timeout or server not available
      if (error.message.includes("timeout") || error.message.includes("xhr poll error")) {
        console.error("🚨 Backend server might not be running or is unreachable at:", config.SERVER_URL);
        console.error("💡 Please check:");
        console.error("   1. Is your backend server running?");
        console.error("   2. Is it running on the correct port/URL?");
        console.error("   3. Are CORS settings configured correctly?");
      }
    };

    const onReconnectAttempt = (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    };

    const onReconnectFailed = () => {
      console.error("❌ All reconnection attempts failed!");
      console.error("🚨 Backend server at", config.SERVER_URL, "is not responding");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.io.on("reconnect_failed", onReconnectFailed);

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.io.off("reconnect_failed", onReconnectFailed);
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
