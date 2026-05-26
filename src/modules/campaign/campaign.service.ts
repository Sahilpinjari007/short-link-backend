import { Analytics } from "../../models/analytics.model";
import { Campaign } from "../../models/campaign.model";
import { Link } from "../../models/link.model";
import {
  CreateCampaignPayload,
  GetUserCampaignsQuery,
  UpdateCampaignPayload,
} from "../../types/campaign.type";
import AppError from "../../utils/AppError";

export const createCampaignService = async (
  userId: string,
  payload: CreateCampaignPayload,
) => {
  if (payload.startAt! > payload.endAt!) {
    throw new AppError("End date must be after start date", 400);
  }

  if (new Date(payload.endAt!) < new Date()) {
    throw new AppError("End date cannot be past", 400);
  }

  const existingCampaign = await Campaign.findOne({
    userId,
    name: payload.name,
  });

  if (existingCampaign) {
    throw new AppError("Campaign already exists with this name", 409);
  }

  const campaign = await Campaign.create({
    userId,
    name: payload.name,
    description: payload.description,
    startAt: payload.startAt ? new Date(payload.startAt) : undefined,
    endAt: payload.endAt ? new Date(payload.endAt) : undefined,
    clicksGoal: Number(payload.clicksGoal),
    color: payload.color,
  });

  return campaign;
};

export const toggleCampaignStatusService = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (campaign.status === "Expired") {
    throw new AppError("Expired campaign cannot be toggled", 400);
  }

  campaign.status = campaign.status === "Active" ? "Inactive" : "Active";
  await campaign.save();

  return campaign;
};

export const updateCampaignService = async (
  campaignId: string,
  payload: UpdateCampaignPayload,
) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (payload.startAt! > payload.endAt!) {
    throw new AppError("End date must be after start date", 400);
  }

  if (new Date(payload.endAt!) < new Date()) {
    throw new AppError("End date cannot be past", 400);
  }

  if (payload.name !== undefined) {
    campaign.name = payload.name;
  }

  if (payload.description !== undefined) {
    campaign.description = payload.description || undefined;
  }

  if (payload.startAt !== undefined) {
    campaign.startAt =
      payload.startAt === "" ? undefined : new Date(payload.startAt);
  }

  if (payload.endAt !== undefined) {
    campaign.endAt = payload.endAt === "" ? undefined : new Date(payload.endAt);
  }

  if (payload.clicksGoal !== undefined) {
    campaign.clicksGoal = Number(payload.clicksGoal);
  }

  if (payload.color !== undefined) {
    campaign.color = payload.color;
  }

  if (campaign.endAt && campaign.endAt < new Date()) {
    campaign.status = "Expired";
  }

  await campaign.save();

  return campaign;
};

export const getUserCampaignsService = async (
  userId: string,
  query: GetUserCampaignsQuery,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters: any = {
    userId,
  };

  if (query.search) {
    filters.$or = [
      {
        name: {
          $regex: query.search,
          $options: "i",
        },
      },

      {
        description: {
          $regex: query.search,
          $options: "i",
        },
      },
    ];
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.startAt) {
    filters.startAt = {};
    filters.startAt.$gte = new Date(query.startAt);
  }

  if (query.endAt) {
    filters.endAt = {};
    filters.endAt.$lte = new Date(query.endAt);
  }

  if (query.quickFilter) {
    const now = new Date();
    const startDate = new Date();
    filters.createdAt = {};

    if (query.quickFilter === "today") {
      startDate.setHours(0, 0, 0, 0);
    }

    if (query.quickFilter === "week") {
      startDate.setDate(now.getDate() - 7);
    }

    if (query.quickFilter === "month") {
      startDate.setDate(now.getMonth() - 1);
    }

    filters.createdAt.$gte = startDate;
  }

  const [campaigns, totalCampaigns] = await Promise.all([
    Campaign.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Campaign.countDocuments(filters),
  ]);

  return {
    campaigns,

    pagination: {
      page,
      limit,
      totalCampaigns,
      totalPages: Math.ceil(totalCampaigns / limit),
    },
  };
};
export const getCampaignDetailsService = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  const links = await Link.find({
    campaignId: campaign._id,
  })
    .select("title shortCode originalUrl clicks")
    .sort({
      clicks: -1,
    });

  const linkIds = links.map((link) => link._id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const analytics = await Analytics.aggregate([
    {
      $match: {
        resourceType: "link",
        resourceId: {
          $in: linkIds,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalClicks: {
          $sum: 1,
        },
        clicksToday: {
          $sum: {
            $cond: [
              {
                $gte: ["$clickedAt", today],
              },
              1,
              0,
            ],
          },
        },
        clicksLast30Days: {
          $sum: {
            $cond: [
              {
                $gte: ["$clickedAt", last30Days],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const overview = analytics[0] || {
    totalClicks: 0,
    clicksToday: 0,
    clicksLast30Days: 0,
  };

  const clicksGoal = Number(campaign.clicksGoal) || 0;
  const totalClicks = Number(overview.totalClicks) || 0;

  const goalProgress =
    clicksGoal > 0
      ? Math.min(
          Math.round((totalClicks / clicksGoal) * 100),

          100,
        )
      : 0;

  return {
    campaign: {
      _id: campaign._id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      color: campaign.color,
      startAt: campaign.startAt,
      endAt: campaign.endAt,
    },

    overview: {
      totalLinks: links.length,
      totalClicks: overview.totalClicks,
      clicksToday: overview.clicksToday,
      clicksLast30Days: overview.clicksLast30Days,
      clicksGoal: campaign.clicksGoal,
      goalProgress,
    },

    links,
  };
};
