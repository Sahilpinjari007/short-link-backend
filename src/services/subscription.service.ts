import { IPayment } from "../models/payment.model";
import Subscription from "../models/subscription.model";

export const activateSubscription = async (payment: IPayment) => {
  const startedAt = new Date();
  const expiresAt = new Date();

  if (payment.billingCycle === "monthly") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  await Subscription.findOneAndUpdate(
    {
      userId: payment.userId,
    },
    {
      planId: payment.planId,
      billingCycle: payment.billingCycle,
      status: "active",
      startedAt,
      expiresAt,
    },
    {
      new: true,
    },
  );
};
