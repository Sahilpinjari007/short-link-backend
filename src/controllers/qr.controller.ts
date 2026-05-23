import { Request, Response } from "express";
import asyncHandler from "../utils/asynHandler";
import {
  createQrService,
  getUserQrsService,
  toggleQrStatusService,
  updateQrService,
} from "../modules/qr/qr.service";
import AppResponse from "../utils/AppResponse";
import { GetUserLinksQuery } from "../types/link.type";

export const createQr = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const qr = await createQrService(user._id.toString(), req.body);

  return res.status(201).json(new AppResponse("QR created successfully", qr));
});

export const toggleQrStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;
    const { qrId } = req.params as { qrId: string };

    const qr = await toggleQrStatusService(user._id.toString(), qrId);

    const responseMsg =
      qr.status == "Active"
        ? "Qr activated successfuly"
        : "Qr deactivated successfuly";

    return res.status(200).json(new AppResponse(responseMsg, qr));
  },
);

export const updateQr = asyncHandler(async (req: Request, res: Response) => {
  const { qrId } = req.params as { qrId: string };

  const updatedQr = await updateQrService(qrId, req.body);

  return res
    .status(200)
    .json(new AppResponse("Qr updated successfully", updatedQr));
});

export const getUserQrs = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const query = req.query as GetUserLinksQuery;

  const data = await getUserQrsService(user._id.toString(), query);

  return res
    .status(200)
    .json(new AppResponse("Qrs fetched successfully", data));
});
