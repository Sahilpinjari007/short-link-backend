import { Request, Response } from "express";
import asyncHandler from "../utils/asynHandler";
import {
  accessOverTimeService,
  deviceAnalyticsService,
  geographicAnalyticsService,
  overviewService,
  recentActivityService,
  topPerformingResourcesService,
  trafficeSourceService,
} from "../modules/analytics/analytics.service";
import AppResponse from "../utils/AppResponse";

export const analyticsOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const data = await overviewService(user._id.toString());

    return res
      .status(200)
      .json(new AppResponse("Analytics overview fetched", data));
  },
);

export const accessOverTime = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;
    const { range } = req.query as { range: string };

    const data = await accessOverTimeService(user._id.toString(), range);

    return res
      .status(200)
      .json(new AppResponse("Access over time fetched", data));
  },
);

export const geographicAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const data = await geographicAnalyticsService(user._id.toString());

    return res
      .status(200)
      .json(new AppResponse("Geographic analytics fetched", data));
  },
);

export const deviceAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const data = await deviceAnalyticsService(user._id.toString());

    return res
      .status(200)
      .json(new AppResponse("Device analytics fetched", data));
  },
);

export const trafficSources = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const data = await trafficeSourceService(user._id.toString());

    return res
      .status(200)
      .json(new AppResponse("Traffic sources fetched", data));
  },
);

export const recentActivity = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const data = await recentActivityService(user._id.toString());

    return res
      .status(200)
      .json(new AppResponse("Recent activity fetched", data));
  },
);

export const topPerformingResources = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const data = await topPerformingResourcesService(user._id.toString());

    return res
      .status(200)
      .json(new AppResponse("Top performing links fetched", data));
  },
);
