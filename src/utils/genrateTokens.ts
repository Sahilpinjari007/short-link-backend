import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

interface TokenPayload {
  userId: string;
}

export const generateAccessToken = async ({ userId }: TokenPayload) => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = async ({ userId }: TokenPayload) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const generateResetPassToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return { resetToken, hashedToken };
};
