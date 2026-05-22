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

const router = Router();

router.route("/overview").get(authMiddleware, analyticsOverview);
router.route("/access-over-time").get(authMiddleware, accessOverTime);
router.route("/geographic").get(authMiddleware, geographicAnalytics);
router.route("/devices").get(authMiddleware, deviceAnalytics);
router.route("/traffic-sources").get(authMiddleware, trafficSources);
router.route("/recent-activity").get(authMiddleware, recentActivity);
router.route("/top-resources").get(authMiddleware, topPerformingResources);
export default router;
