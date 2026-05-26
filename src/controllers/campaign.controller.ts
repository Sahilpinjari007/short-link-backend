import { Request, Response } from "express";
import asyncHandler from "../utils/asynHandler";
import {
  createCampaignService,
  getCampaignDetailsService,
  getUserCampaignsService,
  toggleCampaignStatusService,
  updateCampaignService,
} from "../modules/campaign/campaign.service";
import AppResponse from "../utils/AppResponse";
import { GetUserCampaignsQuery } from "../types/campaign.type";

export const createCampaign = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const campaign = await createCampaignService(user._id.toString(), req.body);

    return res
      .status(201)
      .json(new AppResponse("Campaign created successfully", campaign));
  },
);

export const toggleCampaignStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { campaignId } = req.params as { campaignId: string };

    const campaign = await toggleCampaignStatusService(campaignId);

    return res
      .status(200)
      .json(new AppResponse("Campaign status updated", campaign));
  },
);

export const updateCampaign = asyncHandler(
  async (req: Request, res: Response) => {
    const { campaignId } = req.params as { campaignId: string };

    const campaign = await updateCampaignService(campaignId, req.body);

    return res
      .status(200)
      .json(new AppResponse("Campaign updated successfully", campaign));
  },
);

export const getUserCampaigns = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;
    const query = req.query as GetUserCampaignsQuery;

    const data = await getUserCampaignsService(user._id.toString(), query);

    return res
      .status(200)
      .json(new AppResponse("Campaigns fetched successfully", data));
  },
);

export const getCampaignDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { campaignId } = req.params as { campaignId: string };

    const data = await getCampaignDetailsService(campaignId);

    return res
      .status(200)
      .json(new AppResponse("Campaign details fetched successfully", data));
  },
);
