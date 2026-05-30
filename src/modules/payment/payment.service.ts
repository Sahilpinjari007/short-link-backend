import { env } from "../../config/env";
import { razorpay } from "../../config/razorpay";
import Payment, { IPayment } from "../../models/payment.model";
import Plan from "../../models/plan.model";
import { activateSubscription } from "../../services/subscription.service";
import AppError from "../../utils/AppError";
import crypto from "crypto";

export const createOrderService = async (
  userId: string,
  planId: string,
  billingCycle: "monthly" | "yearly",
) => {
  const plan = await Plan.findById(planId);

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  const amount =
    billingCycle === "monthly"
      ? plan.pricing.monthly.price
      : plan.pricing.yearly.billedAmount;

  const amountInPaisa = amount * 100;

  const order = await razorpay.orders.create({
    amount: amountInPaisa,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  const payment = await Payment.create({
    userId,
    planId,
    razorpayOrderId: order.id,
    billingCycle,
    amount,
    currency: "INR",
    status: "created",
  });

  return {
    orderId: order.id,
    amount,
    currency: order.currency,
    paymentId: payment._id,
    key: env.RAZORPAY_KEY_ID,
  };
};

export const verfiyPaymentService = async (
  userId: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
) => {
  const generatedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new AppError("Invalid payment signature", 400);
  }

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.status === "paid") {
    throw new AppError("Payment already verified", 400);
  }

  payment.status = "paid";
  payment.razorpayPaymentId = razorpay_payment_id;

  payment.paidAt = new Date();

  await payment.save();

  await activateSubscription(payment);

  return null;
};
