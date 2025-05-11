// WebSocket client setup
let socket: WebSocket | null = null;
let reconnectInterval: number | null = null;
const reconnectTime = 3000; // 3 seconds

type MessageHandler = (data: any) => void;
const messageHandlers: Record<string, MessageHandler[]> = {};

// Initialize WebSocket connection
export const initializeSocket = (): WebSocket => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
    
    // Send initial ping to verify connection
    setTimeout(() => {
      sendMessage('ping', {});
    }, 500);
  };
  
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      handleMessage(message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    
    // Setup reconnection
    if (!reconnectInterval) {
      reconnectInterval = window.setInterval(() => {
        console.log('Attempting to reconnect WebSocket...');
        initializeSocket();
      }, reconnectTime);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    socket?.close();
  };
  
  return socket;
};

// Send message through WebSocket
export const sendMessage = (type: string, data: any): void => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected, attempting to reconnect...');
    socket = initializeSocket();
    // Queue the message to be sent after connection
    setTimeout(() => sendMessage(type, data), 1000);
    return;
  }
  
  socket.send(JSON.stringify({ type, data }));
};

// Register handler for specific message type
export const onMessage = (type: string, handler: MessageHandler): (() => void) => {
  if (!messageHandlers[type]) {
    messageHandlers[type] = [];
  }
  
  messageHandlers[type].push(handler);
  
  // Return unsubscribe function
  return () => {
    const index = messageHandlers[type].indexOf(handler);
    if (index !== -1) {
      messageHandlers[type].splice(index, 1);
    }
  };
};

// Handle incoming messages
const handleMessage = (message: { type: string; data: any }): void => {
  const { type, data } = message;
  
  if (messageHandlers[type]) {
    messageHandlers[type].forEach(handler => handler(data));
  }
};

// Check if WebSocket is connected
export const isConnected = (): boolean => {
  return !!socket && socket.readyState === WebSocket.OPEN;
};

// Create a hook for components to use WebSocket
export default {
  initializeSocket,
  sendMessage,
  onMessage,
  isConnected
};
