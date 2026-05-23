import { Request, Response } from "express";
import asyncHandler from "../utils/asynHandler";
import AppResponse from "../utils/AppResponse";
import { getClientILp } from "../utils/analytics.util";
import { resolveRedirectService } from "../modules/redirect/redirect.service";

export const resolveRedirect = asyncHandler(
  async (req: Request, res: Response) => {
    const { shortCode } = req.params as {
      shortCode: string;
    };

    const ipAddress = getClientILp(req);
    const userAgent = req.headers["user-agent"]!;
    const referrer = req.headers.referer!;

    const data = await resolveRedirectService(
      shortCode,
      ipAddress,
      userAgent,
      referrer,
    );

    return res
      .status(200)
      .json(new AppResponse("Redirect link validated", data));
  },
);
