import { Router } from "express";
import UserController from "../controllers/UserController";
import { validateInputData } from "../middlewares/validate";
import { signupSchema } from "../schemas/signup";
import { signinSchema } from "../schemas/signinSchema";

const router = Router();

router.post("/signup", validateInputData(signupSchema), UserController.signup);
router.post("/signin", validateInputData(signinSchema), UserController.signin);
router.post("/logout", UserController.logout);
router.get("/check", UserController.checkAuth);

export default router;
