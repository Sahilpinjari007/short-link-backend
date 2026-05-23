import { Request, Response } from "express";
import asyncHandler from "../utils/asynHandler";
import {
  createLinkService,
  getUserLinksService,
  toggleLinkStatusService,
  updateLinkService,
  verifyLinkPasswordService,
} from "../modules/link/link.service";
import AppResponse from "../utils/AppResponse";
import { GetUserLinksQuery } from "../types/link.type";
import { getClientILp } from "../utils/analytics.util";

export const createLink = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const link = await createLinkService(user?._id.toString(), req.body);

  return res.status(200).json(new AppResponse("Short URL created", link));
});

export const verifyLinkPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { shortCode, password } = req.body;

    const ipAddress = getClientILp(req);
    const userAgent = req.headers["user-agent"]!;
    const referrer = req.headers.referer!;

    const data = await verifyLinkPasswordService(
      shortCode,
      password,
      ipAddress,
      userAgent,
      referrer,
    );

    res.status(200).json(new AppResponse("Password verified", data));
  },
);

export const toggleLinkStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { linkId } = req.params as { linkId: string };
    const user = req.user!;

    const link = await toggleLinkStatusService(user._id.toString(), linkId);

    const responseMsg =
      link.status == "Active"
        ? "Link activated successfuly"
        : "Link deactivated successfuly";

    return res.status(200).json(new AppResponse(responseMsg, link));
  },
);

export const updateLink = asyncHandler(async (req: Request, res: Response) => {
  const { linkId } = req.params as { linkId: string };

  const updatedLink = await updateLinkService(linkId, req.body);

  return res
    .status(200)
    .json(new AppResponse("Link updated successfully", updatedLink));
});

export const getUserLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;
    const query = req.query as GetUserLinksQuery;

    const data = await getUserLinksService(user._id.toString(), query);

    return res
      .status(200)
      .json(new AppResponse("Links fetched successfully", data));
  },
);
