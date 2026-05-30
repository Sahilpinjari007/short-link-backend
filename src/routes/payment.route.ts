import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";
import {
  createOrderSchema,
  verifyPaymentSchema,
} from "../modules/payment/payment.validation";
import { createOrder, verifyPayment } from "../controllers/payment.controller";
import { razorpayWebHook } from "../webhook/payment.webhook.controller";

const router = Router();

router
  .route("/create-order")
  .post(authMiddleware, validate(createOrderSchema), createOrder);
router
  .route("/verify")
  .post(authMiddleware, validate(verifyPaymentSchema), verifyPayment);
router.route("/webhook").post(razorpayWebHook);

export default router;
