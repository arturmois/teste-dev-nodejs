"use client";

import { useCallback, useEffect, useState } from "react";

import { socket } from "./socket";

interface SocketState {
  isConnected: boolean;
  transport: string;
}

const useSocket = () => {
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: socket.connected,
    transport: socket.connected ? socket.io.engine.transport.name : "N/A",
  });

  const onConnect = useCallback(() => {
    setSocketState((prev) => {
      const newTransport = socket.io.engine.transport.name;
      if (!prev.isConnected || prev.transport !== newTransport) {
        return {
          isConnected: true,
          transport: newTransport,
        };
      }
      return prev;
    });
  }, []);

  const onDisconnect = useCallback(() => {
    setSocketState((prev) => {
      if (prev.isConnected) {
        return {
          isConnected: false,
          transport: "N/A",
        };
      }
      return prev;
    });
  }, []);

  const onTransportUpgrade = useCallback((transport: { name: string }) => {
    setSocketState((prev) => {
      if (prev.transport !== transport.name) {
        return {
          ...prev,
          transport: transport.name,
        };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const handleTransportUpgrade = (transport: { name: string }) =>
      onTransportUpgrade(transport);

    if (socket.connected) {
      socket.io.engine.on("upgrade", handleTransportUpgrade);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.engine.off("upgrade", handleTransportUpgrade);
    };
  }, [onConnect, onDisconnect, onTransportUpgrade]);

  return {
    socket,
    isConnected: socketState.isConnected,
    transport: socketState.transport,
  };
};

export default useSocket;
