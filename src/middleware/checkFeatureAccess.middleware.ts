import { NextFunction, Request, Response } from "express";
import Subscription from "../models/subscription.model";
import AppError from "../utils/AppError";

export const checkFeatureAccess = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
    }).populate("planId");

    if (!subscription) {
      throw new AppError("No any subscription active", 403);
    }

    const plan = subscription.planId as any;
    const featureAccess = plan.features[feature];

    if (!featureAccess) {
      throw new AppError(
        "Please upgrade your plan to access this feature.",
        403,
      );
    }

    next();
  };
};
