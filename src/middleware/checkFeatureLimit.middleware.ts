import { NextFunction, Request, Response } from "express";
import Subscription from "../models/subscription.model";
import { Model } from "mongoose";
import AppError from "../utils/AppError";
import { Link } from "../models/link.model";
import { QR } from "../models/qr.model";
import { Campaign } from "../models/campaign.model";

const featureModelMap: Record<'maxLinks' | 'maxQrs' | 'maxCampaigns', Model<any>> = {
  maxLinks: Link,
  maxQrs: QR,
  maxCampaigns: Campaign,
};

export const checkFeatureLimit = (feature: keyof typeof featureModelMap) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
    }).populate("planId");

    if (!subscription) {
      return next(new AppError("No any subscription active", 404));
    }

    const plan = subscription.planId as any;
    const limit = plan.features[feature];
    const Model = featureModelMap[feature];

    const currentUsage = await Model.countDocuments({
      userId: user._id,
    });

    if (currentUsage >= limit) {
      return next(
        new AppError(
          `You have reached your ${feature} limit. Please upgrade your plan.`,
          403,
        ),
      );
    }

    next();
  };
};
