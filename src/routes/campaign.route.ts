import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";
import {
  createCampaignSchema,
  updateCampaignSchema,
} from "../modules/campaign/campaign.validation";
import {
  createCampaign,
  getCampaignDetails,
  getUserCampaigns,
  toggleCampaignStatus,
  updateCampaign,
} from "../controllers/campaign.controller";
import { checkFeatureLimit } from "../middleware/checkFeatureLimit.middleware";

const router = Router();

router
  .route("/")
  .post(
    authMiddleware,
    checkFeatureLimit("maxCampaigns"),
    validate(createCampaignSchema),
    createCampaign,
  );
router
  .route("/toggle-status/:campaignId")
  .patch(authMiddleware, toggleCampaignStatus);
router
  .route("/:campaignId")
  .patch(authMiddleware, validate(updateCampaignSchema), updateCampaign);

router.route("/").get(authMiddleware, getUserCampaigns);
router.route("/:campaignId").get(authMiddleware, getCampaignDetails);

export default router;
