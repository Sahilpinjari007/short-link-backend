import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
  totalLinks: number;
  clicksGoal: number;
  status: "Active" | "Inactive" | "Expired";
  color: string;
  totalClicks: number;
}

const campaignSchema = new mongoose.Schema<ICampaign>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    startAt: {
      type: Date,
    },
    endAt: {
      type: Date,
    },
    totalLinks: { type: Number, default: 0 },
    clicksGoal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Expired"],
      default: "Active",
    },
    color: { type: String, default: "#3b82f6" },
    totalClicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Campaign = mongoose.model("Campaign", campaignSchema);