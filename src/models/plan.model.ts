import mongoose, { Schema, Document } from "mongoose";

export interface IFeature extends Document {
  maxLinks: number;
  maxQrs: number;
  maxCampaigns: number;
  analyticsAccess: boolean;
  customDomains: boolean;
}

export interface IPricing extends Document {
  monthly: {
    price: number;
  };
  yearly: {
    monthlyEquivalent: number;
    billedAmount: number;
  };
}

export interface IPlan extends Document {
  name: string;
  slug: string;
  description: string;
  pricing: IPricing;
  features: IFeature;
  isActive: boolean;
  order: number;
}

const featureSchema = new Schema<IFeature>(
  {
    maxLinks: { type: Number, default: 0 },
    maxQrs: { type: Number, default: 0 },
    maxCampaigns: { type: Number, default: 0 },
    analyticsAccess: { type: Boolean, default: false },
    customDomains: { type: Boolean, default: false },
  },
  {
    _id: false,
  },
);

const pricingSchema = new Schema<IPricing>(
  {
    monthly: {
      price: {
        type: Number,
        default: 0,
      },
    },

    yearly: {
      monthlyEquivalent: {
        type: Number,
        default: 0,
      },

      billedAmount: {
        type: Number,
        default: 0,
      },
    },
  },

  {
    _id: false,
  },
);

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    pricing: pricingSchema,
    features: featureSchema,
    isActive: { type: Boolean, default: true },
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

const Plan = mongoose.model<IPlan>("Plan", planSchema);

export default Plan;
