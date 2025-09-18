export interface MessageData {
  content: string;
  receiverId: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
}

export interface SocketUserData {
  id: string;
  name: string;
  username: string;
  isOnline: boolean;
  lastSeen: Date;
  avatar: string;
}
