import { Request } from "express";

export const getClientILp = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "";
};

export const normalizeTrafficSource = (referrer?: string) => {
  if (!referrer) {
    return "Direct";
  }

  const source = referrer.toLowerCase();

  if (source.includes("google")) {
    return "Google";
  }

  if (source.includes("instagram")) {
    return "Instagram";
  }

  if (source.includes("facebook")) {
    return "Facebook";
  }

  if (source.includes("twitter")) {
    return "Twitter";
  }

  if (source.includes("linkedin")) {
    return "LinkedIn";
  }

  if (source.includes("youtube")) {
    return "YouTube";
  }

  if (source.includes("reddit")) {
    return "Reddit";
  }

  if (source.includes("telegram")) {
    return "Telegram";
  }

  return "Other";
};
