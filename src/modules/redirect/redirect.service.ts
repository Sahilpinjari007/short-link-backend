import { Link } from "../../models/link.model";
import { QR } from "../../models/qr.model";
import { createAnalytics } from "../analytics/analytics.service";

export const resolveRedirectService = async (
  shortCode: string,
  ipAddress: string,
  userAgent: string,
  referrer: string,
) => {
  const link = await Link.findOne({ shortCode }).select("+password");

  if (link) {
    if (link.status !== "Active") {
      // if link is inactive
      return {
        type: "ERROR",
        state: "link-inactive",
      };
    }

    if (
      (link.startAt && link.startAt > new Date()) ||
      (link.endAt && link.endAt < new Date())
    ) {
      // if link is expired
      return {
        type: "ERROR",
        state: "link-expired",
      };
    }

    if (link.isPasswordProtected) {
      // if link has password
      return {
        type: "ERROR",
        state: "link-unauthorized",
      };
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

    // redirect to main url
    return {
      type: "REDIRECT",
      resourceType: "link",
      redirectUrl: link.originalUrl,
    };
  }

  const qr = await QR.findOne({ shortCode });

  if (qr) {
    if (qr.status !== "Active") {
      // if qr is inactive
      return {
        type: "ERROR",
        state: "qrcode-inactive",
      };
    }

    qr.totalScans += 1;
    await qr.save();

    await createAnalytics({
      userId: qr.userId.toString(),
      resourceType: "qr",
      resourceId: qr._id.toString(),
      ipAddress,
      userAgent,
      referrer,
    });

    // redirect to main url
    return {
      type: "REDIRECT",
      resourceType: "qr",
      redirectUrl: qr.targetUrl,
    };
  }

  // if link not found
  return {
    type: "ERROR",
    state: "link-not-found",
  };
};
