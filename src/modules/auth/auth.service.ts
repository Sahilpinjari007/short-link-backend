import AppError from "../../utils/AppError";
import User from "../../models/user.model";
import generateOTP from "../../utils/genrateOTP";
import { sendEmail } from "../../services/email.service";
import {
  forgetPassEmailTemplate,
  verificationEmailTemplate,
} from "../../utils/emailTemplates";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetPassToken,
} from "../../utils/genrateTokens";
import { env } from "../../config/env";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const registerUserService = async (fullname: string, email: string, password: string) => {
  const existingUser = await User.findOne({ email });

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError("User already exists", 400);
    }

    existingUser.password = password;
    existingUser.verificationOTP = otp;
    existingUser.verificationOTPExpires = otpExpiry;
    await existingUser.save();
  } else {
    await User.create({
      fullname,
      email,
      password,
      verificationOTP: otp,
      verificationOTPExpires: otpExpiry,
    });
  }

  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    html: verificationEmailTemplate(otp),
  });
};

export const verfiyOTPService = async (email: string, otp: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("User already verified", 400);
  }

  const isValidOTP = await user.verifyOTP(otp);

  if (!isValidOTP) {
    throw new AppError("Invalid OTP", 400);
  }

  if (
    !user.verificationOTPExpires ||
    user.verificationOTPExpires < new Date()
  ) {
    throw new AppError("OTP expired", 400);
  }

  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;

  const accessToken = await generateAccessToken({
    userId: user._id.toString(),
  });
  const refreshToken = await generateRefreshToken({
    userId: user._id.toString(),
  });

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
  };
};

export const loginUserService = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) {
    throw new AppError("Invalid email or password", 400);
  }

  const accessToken = await generateAccessToken({
    userId: user._id.toString(),
  });

  const refreshToken = await generateRefreshToken({
    userId: user._id.toString(),
  });

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const forgetUserPassService = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return;
  }

  const { resetToken, hashedToken } = generateResetPassToken();

  user.forgetPassToken = hashedToken;
  user.forgetPassTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.save();

  const resetURL = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: forgetPassEmailTemplate(resetURL),
  });
};

export const resetUserPassService = async (
  token: string,
  newPassword: string,
) => {
  const hashdToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgetPassToken: hashdToken,
    forgetPassTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset link", 400);
  }

  user.password = newPassword;
  user.forgetPassToken = undefined;
  user.forgetPassTokenExpires = undefined;

  await user.save();
};

export const refreshAccessTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      userId: string;
    };
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (refreshToken !== user.refreshToken) {
    throw new AppError("Refresh token mismatch", 401);
  }

  const accessToken = await generateAccessToken({
    userId: user._id.toString(),
  });

  return { accessToken };
};

export const logOutUserService = async (refreshToken: string) => {
  if (!refreshToken) {
    return;
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    return;
  }

  user.refreshToken = undefined;
  await user.save();
};
