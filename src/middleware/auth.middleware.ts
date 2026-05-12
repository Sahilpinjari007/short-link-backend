import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import User from "../models/user.model";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized access", 401));
  }

  const token = authHeader.replace("Bearer ", "");

  let decoded;

  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
  } catch (error) {
    return next(new AppError("Unauthorized access", 401));
  }

  const user = await User.findById(decoded.userId).select("_id fullname email plan createdAt updatedAt");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  req.user = user;
  next();
};
