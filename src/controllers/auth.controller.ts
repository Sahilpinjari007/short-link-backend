import { Request, Response } from "express";

import asyncHandler from "../utils/asynHandler";
import AppResponse from "../utils/AppResponse";

import {
  forgetUserPassService,
  loginUserService,
  logOutUserService,
  refreshAccessTokenService,
  registerUserService,
  resetUserPassService,
  verfiyOTPService,
} from "../modules/auth/auth.service";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { fullname, email, password } = req.body;

    await registerUserService(fullname, email, password);

    return res.status(201).json(new AppResponse("OTP sent to email", null));
  },
);

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const token = await verfiyOTPService(email, otp);

  res.cookie("refreshToken", token.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 100,
  });

  return res.status(200).json(
    new AppResponse("Email verified successfully", {
      accessToken: token.accessToken,
    }),
  );
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const tokens = await loginUserService(email, password);

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 100,
  });

  res.status(200).json(
    new AppResponse("Login successfuly", {
      accessToken: tokens.accessToken,
    }),
  );
});

export const forgetUserPass = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await forgetUserPassService(email);

    res
      .status(200)
      .json(new AppResponse("If account exists, reset link sent", null));
  },
);

export const resetUserPass = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await resetUserPassService(token, newPassword);

    res.status(200).json(new AppResponse("Password reset successful", null));
  },
);

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    const data = await refreshAccessTokenService(refreshToken);

    res.status(200).json(new AppResponse("Access token refreshed", data));
  },
);

export const logOutUser = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  await logOutUserService(refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  res.status(200).json(new AppResponse("Logout successful", null));
});
