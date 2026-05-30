import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getCurrentSubscription } from "../controllers/subscription.controller";

const router = Router();

router.route("/current").get(authMiddleware, getCurrentSubscription);

export default router;
