import { Request, Response } from "express";
import Payment from "../models/payment.model";
import crypto from "crypto";
import { activateSubscription } from "../services/subscription.service";

export const razorpayWebHook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Signature",
      });
    }

    const body = JSON.parse(req.body.toString());

    if (body.event !== "payment.captured") {
      return res.status(200).json({
        success: true,
      });
    }

    const paymentEntity = body.payload.payment.entity;
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment Not Found",
      });
    }
    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
      });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = paymentEntity.id;
    payment.paidAt = new Date();

    await payment.save();

    await activateSubscription(payment);
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
    });
  }
};
