import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface ILink extends Document {
  userId: mongoose.Types.ObjectId;
  title?: string;
  originalUrl: string;
  domain: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  password?: string;
  isPasswordProtected: boolean;
  status: "Active" | "Inactive" | "Expired";
  startAt?: Date;
  endAt?: Date;
  campaignId?: mongoose.Types.ObjectId;

  comparePassword(linkPassword: string): Promise<boolean> ;
}

const linkSchema = new mongoose.Schema<ILink>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: { type: String },
  originalUrl: { type: String, required: true, trim: true },
  domain: {type: String, required: true},
  shortCode: { type: String, required: true, unique: true, index: true },
  shortUrl: {type: String, required: true},
  clicks: { type: Number, default: 0 },
  password: { type: String, select: false },
  isPasswordProtected: { type: Boolean, default: false },
  status: { type: String, enum: ["Active", "Inactive", "Expired"], default: "Active" },
  startAt: {
    type: Date,
  },
  endAt: {
    type: Date,
  },
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
}, {timestamps: true});

linkSchema.pre("save", async function () {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

linkSchema.methods.comparePassword = function (
  linkPassword: string,
): Promise<Boolean> {
  return bcrypt.compare(linkPassword, this.password);
};

export const Link = mongoose.model<ILink>("Link", linkSchema);
