import mongoose from "mongoose";

import dotenv from "dotenv";
import Plan from "../models/plan.model";

dotenv.config();

const seedPlans = async () => {
  try {
    /**
     * connect db
     */
    await mongoose.connect(process.env.MONGO_URI!);

    console.log("MongoDB connected");

    /**
     * clear old plans
     */
    await Plan.deleteMany();

    /**
     * insert plans
     */
    await Plan.insertMany([
      {
        name: "Free",
        slug: "free",
        description: "Basic free plan",
        pricing: {
          monthly: {
            price: 0,
          },

          yearly: {
            monthlyEquivalent: 0,
            billedAmount: 0,
          },
        },

        features: {
          maxLinks: 10,
          maxQrs: 5,
          maxCampaigns: 1,
          analyticsAccess: false,
          customDomains: false,
        },
        order: 1,
      },

      {
        name: "Basic",
        slug: "basic",
        description: "Starter plan for creators",
        pricing: {
          monthly: {
            price: 6,
          },

          yearly: {
            monthlyEquivalent: 5,
            billedAmount: 60,
          },
        },

        features: {
          maxLinks: 100,
          maxQrs: 50,
          maxCampaigns: 10,
          analyticsAccess: false,
          customDomains: false,
        },
        order: 2,
      },

      {
        name: "Pro",
        slug: "pro",
        description: "Professional growth plan",
        pricing: {
          monthly: {
            price: 16,
          },

          yearly: {
            monthlyEquivalent: 13,
            billedAmount: 156,
          },
        },

        features: {
          maxLinks: 1000,
          maxQrs: 500,
          maxCampaigns: 50,
          analyticsAccess: true,
          customDomains: true,
        },
        order: 3,
      },

      {
        name: "Premium",
        slug: "premium",
        description: "Advanced enterprise plan",
        pricing: {
          monthly: {
            price: 49,
          },

          yearly: {
            monthlyEquivalent: 41,
            billedAmount: 492,
          },
        },

        features: {
          maxLinks: 10000,
          maxQrs: 5000,
          maxCampaigns: 500,
          analyticsAccess: true,
          customDomains: true,
        },
        order: 4,
      },
    ]);

    console.log("Plans seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

seedPlans();
