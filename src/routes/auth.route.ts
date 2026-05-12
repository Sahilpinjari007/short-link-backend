import { Router } from "express";

import {
  forgetPassSchema,
  loginSchema,
  registerSchema,
  resetPassSchema,
  verifyOTPSchema,
} from "../modules/auth/auth.validation";

import validate from "../middleware/validate.middleware";
import {
  forgetUserPass,
  loginUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  resetUserPass,
  verifyOTP,
} from "../controllers/auth.controller";

const router = Router();

router.route("/register").post(validate(registerSchema), registerUser);
router.route("/verify-otp").post(validate(verifyOTPSchema), verifyOTP);
router.route("/login").post(validate(loginSchema), loginUser);
router
  .route("/forget-password")
  .post(validate(forgetPassSchema), forgetUserPass);
router.route("/reset-password").post(validate(resetPassSchema), resetUserPass);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(logOutUser);

export default router;
