import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";
import { createQrSchema, updateQrSchema } from "../modules/qr/qr.validation";
import {
  createQr,
  getUserQrs,
  toggleQrStatus,
  updateQr,
} from "../controllers/qr.controller";
import { checkFeatureLimit } from "../middleware/checkFeatureLimit.middleware";

const router = Router();

router.route("/").post(authMiddleware, checkFeatureLimit("maxQrs"), validate(createQrSchema), createQr);
router.route("/toggle-status/:qrId").patch(authMiddleware, toggleQrStatus);
router.route("/:qrId").patch(authMiddleware, validate(updateQrSchema), updateQr);
router.route("/").get(authMiddleware, getUserQrs)

export default router;
