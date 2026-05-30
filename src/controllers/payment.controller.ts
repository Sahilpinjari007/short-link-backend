import { Request, Response } from "express";
import {
  createOrderService,
  verfiyPaymentService,
} from "../modules/payment/payment.service";
import AppResponse from "../utils/AppResponse";
import asyncHandler from "../utils/asynHandler";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const {
    planId,
    billingCycle,
  }: { planId: string; billingCycle: "monthly" | "yearly" } = req.body;

  const data = await createOrderService(
    user._id.toString(),
    planId,
    billingCycle,
  );

  return res
    .status(201)
    .json(new AppResponse("Order created successfully", data));
});

export const verifyPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    await verfiyPaymentService(
      user._id.toString(),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    return res
      .status(200)
      .json(new AppResponse("Payment verified successfully", null));
  },
);
