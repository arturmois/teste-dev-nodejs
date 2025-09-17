export interface SocketUserData {
  id: string;
  name: string;
  username: string;
  isOnline: boolean;
  lastSeen: Date;
  avatar: string;
}

export interface MessageData {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
}
