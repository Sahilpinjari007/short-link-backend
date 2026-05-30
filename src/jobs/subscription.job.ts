import corn from "node-cron";
import Subscription from "../models/subscription.model";
import Plan from "../models/plan.model";

export const startSubscriptionCorn = () => {
  corn.schedule("0 0 * * *", async () => {
    const freePlan = await Plan.findOne({
      name: "Free",
    });

    if (!freePlan) return;

    const expiredSubscriptions = await Subscription.find({
      status: "active",
      expiresAt: {
        $lte: new Date(),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = "expired";
      subscription.planId = freePlan._id;
      await subscription.save();
    }
  });
};
