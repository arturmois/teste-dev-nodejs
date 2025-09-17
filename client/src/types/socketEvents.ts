export const socketEvents = {
  HELLO: "hello",
  CONNECT: "connect",
  CONNECT_ERROR: "connect_error",
  DISCONNECT: "disconnect",
  ONLINE_USERS: "online_users",
  ONLINE_USER: "online_user",
  OFFLINE_USER: "offline_user",
  NEW_MESSAGE: "new_message",
  SEND_MESSAGE: "send_message",
  MESSAGE_SENT: "message_sent",
  USER_TYPING: "user_typing",
  USER_STOPPED_TYPING: "user_stopped_typing",
} as const;
