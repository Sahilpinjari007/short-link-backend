import { getPlansService } from "../modules/plan/plan.service";
import AppResponse from "../utils/AppResponse";
import asyncHandler from "../utils/asynHandler";

export const getPlans = asyncHandler(async (req, res) => {
  const plans = await getPlansService();

  return res
    .status(200)
    .json(new AppResponse("Plans fetched successfully", plans));
});
