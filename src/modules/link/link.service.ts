import { nanoid } from "nanoid";
import { Link } from "../../models/link.model";
import AppError from "../../utils/AppError";
import { Types } from "mongoose";
import {
  CreateLinkPayload,
  GetUserLinksQuery,
  UpdateLinkPayload,
} from "../../types/link.type";
import { createAnalytics } from "../analytics/analytics.service";

export const createLinkService = async (
  userId: string,
  payload: CreateLinkPayload,
) => {
  let shortCode = payload.customeCode?.trim() || nanoid(7);

  const existingLink = Link.findOne({ shortCode });

  if (!existingLink) throw new AppError("Short code already exists", 400);

  if (payload.startAt! > payload.endAt!) {
    throw new AppError("End date must be after start date", 400);
  }

  if (new Date(payload.endAt!) < new Date()) {
    throw new AppError("End date cannot be past", 400);
  }

  const startAt = payload.startAt ? new Date(payload.startAt) : undefined;
  const endAt = payload.endAt ? new Date(payload.endAt) : undefined;

  const link = await Link.create({
    userId,
    originalUrl: payload.originalUrl.trim(),
    domain: payload.domain.trim(),
    shortCode,
    shortUrl: `https://${payload.domain.trim()}/${shortCode}`,
    title: payload.title || undefined,
    startAt,
    endAt,
    password: payload.password || undefined,
    isPasswordProtected: !!payload.password,
    campaignId: payload.campaignId || undefined,
  });

  return link;
};

export const verifyLinkPasswordService = async (
  shortCode: string,
  password: string,
  ipAddress: string,
  userAgent: string,
  referrer: string,
) => {
  const link = await Link.findOne({ shortCode }).select("+password");

  if (!link) {
    throw new AppError("Link not found", 404);
  }

  if (!link.isPasswordProtected) {
    throw new AppError("Link is public", 400);
  }

  const isValid = await link.comparePassword(password);

  if (!isValid) {
    throw new AppError("Invalid password", 401);
  }

  link.clicks += 1;
  await link.save();

  await createAnalytics({
    userId: link.userId.toString(),
    resourceType: "link",
    resourceId: link._id.toString(),
    ipAddress,
    userAgent,
    referrer,
  });

  return {
    type: "REDIRECT",
    redirectUrl: link.originalUrl,
  };
};

export const toggleLinkStatusService = async (
  userId: string,
  linkId: string,
) => {
  const link = await Link.findOne({ _id: linkId, userId });

  if (!link) {
    throw new AppError("Link not found", 404);
  }

  link.status = link.status === "Active" ? "Inactive" : "Active";

  await link.save();

  return link;
};

export const updateLinkService = async (
  linkId: string,
  payload: UpdateLinkPayload,
) => {
  const link = await Link.findById(linkId).select("+password");

  if (!link) {
    throw new AppError("Link not found", 404);
  }

  if (payload.originalUrl !== undefined) {
    link.originalUrl = payload.originalUrl;
  }

  if (payload.domain !== undefined) {
    link.domain = payload.domain;
    link.shortUrl = `https://${payload.domain}/${link.shortCode}`;
  }

  if (payload.customeCode !== undefined) {
    const customCode = payload.customeCode.trim();

    link.shortCode = customCode !== "" ? customCode : nanoid(7);

    // check duplicate shortcode
    const existingLink = await Link.findOne({
      shortCode: link.shortCode,

      _id: {
        $ne: link._id,
      },
    });

    if (existingLink) {
      throw new AppError("Short code already exists", 400);
    }
    link.shortUrl = `https://${link.domain}/${link.shortCode}`;
  }

  if (payload.title !== undefined) {
    link.title = payload.title || undefined;
  }

  if (payload.startAt! > payload.endAt!) {
    throw new AppError("End date must be after start date", 400);
  }

  if (new Date(payload.endAt!) < new Date()) {
    throw new AppError("End date cannot be past", 400);
  }

  if (payload.startAt !== undefined) {
    link.startAt = payload.startAt ? new Date(payload.startAt) : undefined;
  }

  if (payload.endAt !== undefined) {
    link.endAt = payload.endAt ? new Date(payload.endAt) : undefined;
  }

  if (payload.password !== undefined) {
    link.password = payload.password || undefined;
    link.isPasswordProtected = !!payload.password;
  }

  if (payload.campaignId !== undefined) {
    link.campaignId = payload.campaignId
      ? new Types.ObjectId(payload.campaignId)
      : undefined;
  }

  await link.save();

  return link;
};

export const getUserLinksService = async (
  userId: string,
  query: GetUserLinksQuery,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter: any = { userId };

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { originalUrl: { $regex: query.search, $options: "i" } },
      { shortCode: { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.startAt) {
    filter.startAt = {};
    filter.startAt.$gte = new Date(query.startAt);
  }

  if (query.endAt) {
    filter.endAt = {};
    filter.endAt.$lte = new Date(query.endAt);
  }

  if (query.campaignId) {
    filter.campaignId = query.campaignId;
  }

  if (query.quickFilter) {
    const now = new Date();
    const startDate = new Date();
    filter.createdAt = {};

    if (query.quickFilter === "today") {
      startDate.setHours(0, 0, 0, 0);
    }

    if (query.quickFilter === "week") {
      startDate.setDate(now.getDate() - 7);
    }

    if (query.quickFilter === "month") {
      startDate.setDate(now.getMonth() - 1);
    }

    filter.createdAt.$gte = startDate;
  }

  const links = await Link.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalLinks = await Link.countDocuments(filter);

  return {
    links,

    pagination: {
      page,
      limit,
      totalLinks,
      totalPages: Math.ceil(totalLinks / limit),
    },
  };
};
