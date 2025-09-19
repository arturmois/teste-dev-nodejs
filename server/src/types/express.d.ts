import "express-session";

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      username: string;
      avatar?: string;
      is_online?: boolean;
      last_seen?: Date;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    passport?: {
      user?: string;
    };
  }
}
