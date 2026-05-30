import { Campaign } from "../../models/campaign.model";
import { Link } from "../../models/link.model";
import { QR } from "../../models/qr.model";
import Subscription from "../../models/subscription.model";
import AppError from "../../utils/AppError";

export const getCurrentSubscriptionService = async (userId: string) => {
  const subscription = await Subscription.findOne({
    userId,
    status: "active",
  }).populate("planId");

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  const plan = subscription.planId as any;
  const [totalLinks, totalQrs, totalCampaigns] = await Promise.all([
    Link.countDocuments({ userId }),
    QR.countDocuments({ userId }),
    Campaign.countDocuments({ userId }),
  ]);

  const daysRemaining = subscription.expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (subscription.expiresAt.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const features = [
    {
      name: "Links",
      used: totalLinks,
      limit: plan.features.maxLinks,
      remaining: plan.features.maxLinks - totalLinks,
      usagePercentage: Math.min(
        100,
        Math.round((totalLinks / plan.features.maxLinks) * 100),
      ),
    },

    {
      name: "QR Codes",
      used: totalQrs,
      limit: plan.features.maxQrs,
      remaining: plan.features.maxQrs - totalQrs,
      usagePercentage: Math.min(
        100,
        Math.round((totalQrs / plan.features.maxQrs) * 100),
      ),
    },

    {
      name: "Campaigns",
      used: totalCampaigns,
      limit: plan.features.maxCampaigns,
      remaining: plan.features.maxCampaigns - totalCampaigns,
      usagePercentage: Math.min(
        100,
        Math.round((totalCampaigns / plan.features.maxCampaigns) * 100),
      ),
    },
  ];

  return {
    subscription: {
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      daysRemaining,
    },

    plan: {
      id: plan._id,
      name: plan.name,
      description: plan.description,
      pricing: plan.pricing,
    },

    features,
  };
};
