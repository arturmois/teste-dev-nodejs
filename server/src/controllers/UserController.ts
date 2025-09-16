import { Request, Response } from "express";
import Signup from "../services/Signup";
import Signin from "../services/Signin";

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

  async signin(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const { token } = await Signin.execute({ username, password });
      res.status(200).json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new AuthController();
