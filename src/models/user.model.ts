import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  fullname: string;
  email: string;
  password: string;
  plan: "free" | "basic" | "pro" | "premium";
  isVerified: boolean;
  verificationOTP?: string;
  verificationOTPExpires?: Date;
  refreshToken?: string;
  forgetPassToken?: string;
  forgetPassTokenExpires?: Date;

  verifyOTP(candidate: string): Promise<boolean>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullname: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    plan: {
      type: String,
      enum: ["free", "basic", "pro", "premium"],
      default: "free",
    },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    verificationOTPExpires: { type: Date },
    refreshToken: { type: String },
    forgetPassToken: { type: String },
    forgetPassTokenExpires: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.verificationOTP) {
    this.verificationOTP = await bcrypt.hash(this.verificationOTP, 10);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<Boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.verifyOTP = async function (
  candidateOTP: string,
): Promise<Boolean> {
  return bcrypt.compare(candidateOTP, this.verificationOTP);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
