import { Router } from "express";
import UserController from "../controllers/UserController";
import { validateInputData } from "../middlewares/validate";
import { signupSchema } from "../schemas/signup";
import { signinSchema } from "../schemas/signinSchema";
import { authenticateLocal } from "../middlewares/auth";

const router = Router();

router.use("/signup", validateInputData(signupSchema), UserController.signup);
router.use(
  "/signin",
  validateInputData(signinSchema),
  authenticateLocal,
  UserController.signin
);

export default router;
