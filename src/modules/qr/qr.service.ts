import { nanoid } from "nanoid";
import {
  CreateQrPayload,
  GetUserQrsQuery,
  UpdateQrPayload,
} from "../../types/qr.type";
import { env } from "../../config/env";
import QRCode from "qrcode";
import { QR } from "../../models/qr.model";
import AppError from "../../utils/AppError";

export const createQrService = async (
  userId: string,
  payload: CreateQrPayload,
) => {
  const shortCode = nanoid(7);
  const redirectUrl = `https://${payload.domain}/${shortCode}`;

  const qrCodeUrl = await QRCode.toDataURL(redirectUrl, {
    color: {
      dark: payload.foregroundColor || "#000000",
      light: payload.backgroundColor || "#ffffff",
    },
    width: 500,
  });

  const qr = await QR.create({
    userId,
    title: payload.title,
    targetUrl: payload.targetUrl,
    domain: payload.domain,
    shortCode,
    sortUrl: redirectUrl,
    qrCodeUrl,
    foregroundColor: payload.foregroundColor,
    backgroundColor: payload.backgroundColor,
  });
  return qr;
};

export const toggleQrStatusService = async (userId: string, qrId: string) => {
  const qr = await QR.findOne({ _id: qrId, userId });

  if (!qr) {
    throw new AppError("Qr not found", 404);
  }

  qr.status = qr.status === "Active" ? "Inactive" : "Active";

  await qr?.save();

  return qr;
};

export const updateQrService = async (
  qrId: string,
  payload: UpdateQrPayload,
) => {
  const qr = await QR.findById(qrId);

  if (!qr) {
    throw new AppError("Qr not found", 404);
  }

  if (payload.targetUrl) {
    qr.targetUrl = payload.targetUrl;
  }

  if (payload.title) {
    qr.title = payload.title;
  }

  if (payload.domain) {
    qr.domain = payload.domain;
  }

  if (payload.foregroundColor !== undefined) {
    qr.foregroundColor = payload.foregroundColor;
  }

  if (payload.backgroundColor !== undefined) {
    qr.backgroundColor = payload.backgroundColor;
  }

  const redierctUrl = `https://${qr.domain}/${qr.shortCode};`;
  qr.qrCodeUrl = await QRCode.toDataURL(redierctUrl, {
    color: {
      dark: payload.foregroundColor || "#000000",
      light: payload.backgroundColor || "#ffffff",
    },
    width: 500,
  });

  qr.sortUrl = redierctUrl;
  await qr.save();

  return qr;
};

export const getUserQrsService = async (
  userId: string,
  query: GetUserQrsQuery,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  let filters: any = { userId };
  let sort: any = { createdAt: -1 };

  if (query.search) {
    filters.$or = [
      { targetUrl: { $regex: query.search, $options: "i" } },
      { title: { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.quickFilter) {
    const now = new Date();
    const startDate = new Date();

    if (query.quickFilter === "today") {
      startDate.setHours(0, 0, 0, 0);
      filters.createdAt = {
        $gte: startDate,
      };
    }

    if (query.quickFilter === "week") {
      startDate.setDate(now.getDate() - 7);
      filters.createdAt = {
        $gte: startDate,
      };
    }

    if (query.quickFilter === "month") {
      startDate.setMonth(now.getMonth() - 1);
      filters.createdAt = {
        $gte: startDate,
      };
    }

    if (query.quickFilter === "most-scanned") {
      sort = { totalScans: -1 };
    }
  }

  const [qrs, totalQrs] = await Promise.all([
    QR.find(filters).sort(sort).skip(skip).limit(limit),
    QR.countDocuments(filters),
  ]);

  return {
    qrs,

    pagination: {
      page,
      limit,
      totalQrs,
      totalPages: Math.ceil(totalQrs / limit),
    },
  };
};
