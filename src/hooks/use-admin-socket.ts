"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export function useAdminSocket({ url, autoConnect = true }: UseSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    const socketUrl = url || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url, autoConnect]);

  return { socket, isConnected };
}
