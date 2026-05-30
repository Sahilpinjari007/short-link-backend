import Plan from "../../models/plan.model";

export const getPlansService = async () => {
  const plans = await Plan.find(
    {
      isActive: true,
    },
    {
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    },
  ).sort({
    order: 1,
  });

  return plans;
};
