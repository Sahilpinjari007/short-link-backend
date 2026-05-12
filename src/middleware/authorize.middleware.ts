import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

export const allowedPlan =
  (...allowedPlans: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError("Unauthorized access", 401);
    }

    if (!allowedPlans.includes(user.plan)) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };
