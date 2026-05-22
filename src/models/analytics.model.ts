import mongoose, { Schema } from "mongoose";

interface IAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  resourceType: "link" | "qr";
  resourceId: mongoose.Types.ObjectId;
  ipAddress: string;
  region: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device: string;
  trafficSource: string;
  clickedAt: Date;
}

const analyticsSchema = new mongoose.Schema<IAnalytics>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resourceType: { type: String, enum: ["link", "qr"] },
    resourceId: { type: Schema.Types.ObjectId, required: true },
    ipAddress: { type: String },
    region: { type: String },
    country: { type: String },
    city: { type: String },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
    trafficSource: { type: String },
    clickedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Analytics = mongoose.model<IAnalytics>(
  "Analytics",
  analyticsSchema,
);
