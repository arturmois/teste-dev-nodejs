export const socketEvents = {
  CONNECT: "connect",
  CONNECT_ERROR: "connect_error",
  DISCONNECT: "disconnect",
  USERS_ONLINE: "users", // Ajustado para corresponder ao servidor
  NEW_MESSAGE: "new_message",
  MESSAGE_SENT: "message_sent",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  USER_TYPING: "user_typing",
  USER_STOPPED_TYPING: "user_stopped_typing",
} as const;
