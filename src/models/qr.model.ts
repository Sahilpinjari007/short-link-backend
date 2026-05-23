import mongoose, { Document, Schema } from "mongoose";

interface IQR extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  targetUrl: string;
  domain: string;
  shortCode: string;
  sortUrl: string;
  qrCodeUrl: string;
  totalScans: number;
  status: "Active" | "Inactive";
  foregroundColor: string;
  backgroundColor: string;
}

const qrSchema = new mongoose.Schema<IQR>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    targetUrl: { type: String, required: true, trim: true },
    domain: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    sortUrl: { type: String, required: true },
    qrCodeUrl: { type: String, required: true },
    totalScans: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    foregroundColor: {
      type: String,

      default: "#000000",
    },

    backgroundColor: {
      type: String,

      default: "#ffffff",
    },
  },
  { timestamps: true },
);

export const QR = mongoose.model<IQR>("QR", qrSchema);
