import { Request, Response, NextFunction } from "express";
import passport from "passport";
import Signup from "../services/Signup";

class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { name, username, password } = req.body;
      await Signup.execute({ name, username, password });
      res.status(201).json({ message: "User created successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  signin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({
          message: info?.message || "Authentication failed",
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login session error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        return res.status(200).json({
          message: "Login successful",
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
          },
        });
      });
    })(req, res, next);
  }

  logout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  }

  checkAuth(req: Request, res: Response) {
    if (req.isAuthenticated()) {
      res.status(200).json({
        authenticated: true,
        user: req.user,
      });
    } else {
      res.status(401).json({
        authenticated: false,
        message: "Not authenticated",
      });
    }
  }
}

export default new AuthController();
