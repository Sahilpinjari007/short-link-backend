import { Router } from "express";
import validate from "../middleware/validate.middleware";
import {
  createLinkSchema,
  updateLinkSchema,
  verifyLinkPasswordSchema,
} from "../modules/link/link.validation";
import {
  createLink,
  getUserLinks,
  toggleLinkStatus,
  updateLink,
  verifyLinkPassword,
} from "../controllers/link.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.route("/").post(authMiddleware, validate(createLinkSchema), createLink);
router.route("/verify-password").post(validate(verifyLinkPasswordSchema), verifyLinkPassword);
router.route("/toggle-status/:linkId").patch(authMiddleware, toggleLinkStatus);
router.patch("/:linkId", authMiddleware, validate(updateLinkSchema), updateLink);
router.route("/").get(authMiddleware, getUserLinks);

export default router;
