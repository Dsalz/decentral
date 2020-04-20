import { Router } from "express";

// Controllers
import userController from "../controllers/userController";

// Middlewares
import tokenizer from "../middleware/tokenizer";

const router = Router();

router.post("/login", userController.login);
router.get(
  "/refresh-token",
  tokenizer.verifyToken,
  userController.refreshToken
);

export default router;
