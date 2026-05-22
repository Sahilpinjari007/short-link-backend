export interface CreateAnalyticsPayload {
  userId: string;
  resourceType: "link" | "qr";
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}
