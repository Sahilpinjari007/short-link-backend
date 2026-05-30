import z, { string } from "zod";

export const createOrderSchema = z.object({
  planId: string(),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
