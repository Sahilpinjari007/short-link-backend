import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  accessOverTime,
  analyticsOverview,
  deviceAnalytics,
  geographicAnalytics,
  recentActivity,
  topPerformingResources,
  trafficSources,
} from "../controllers/analytics.controller";
import { checkFeatureAccess } from "../middleware/checkFeatureAccess.middleware";

const router = Router();

router
  .route("/overview")
  .get(
    authMiddleware,
    checkFeatureAccess("analyticsAccess"),
    analyticsOverview,
  );
router
  .route("/access-over-time")
  .get(authMiddleware, checkFeatureAccess("analyticsAccess"), accessOverTime);
router
  .route("/geographic")
  .get(
    authMiddleware,
    checkFeatureAccess("analyticsAccess"),
    geographicAnalytics,
  );
router
  .route("/devices")
  .get(authMiddleware, checkFeatureAccess("analyticsAccess"), deviceAnalytics);
router
  .route("/traffic-sources")
  .get(authMiddleware, checkFeatureAccess("analyticsAccess"), trafficSources);
router
  .route("/recent-activity")
  .get(authMiddleware, checkFeatureAccess("analyticsAccess"), recentActivity);
router
  .route("/top-resources")
  .get(
    authMiddleware,
    checkFeatureAccess("analyticsAccess"),
    topPerformingResources,
  );
export default router;
