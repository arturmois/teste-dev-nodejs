import { Router } from "express";
import authRoutes from "./authRoutes";
import { authenticateJWT } from "../middlewares/auth";

const router = Router();

router.use("/auth", authRoutes);

router.get("/profile", authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

export default router;
