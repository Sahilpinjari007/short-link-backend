import { Request, Response } from "express";
import asyncHandler from "../utils/asynHandler";
import { getCurrentSubscriptionService } from "../modules/subscription/subscription.service";
import AppResponse from "../utils/AppResponse";

export const getCurrentSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const data = await getCurrentSubscriptionService(user._id.toString());

    return res
      .status(200)
      .json(new AppResponse("Subscription fetched successfully", data));
  },
);
