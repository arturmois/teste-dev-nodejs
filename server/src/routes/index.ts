import { Router } from "express";
import authRoutes from "./authRoutes";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.use("/auth", authRoutes);

router.get("/profile", isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

export default router;
