export interface CreateCampaignPayload {
  name: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  clicksGoal?: number;
  color?: string;
}

export interface UpdateCampaignPayload {
  name?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  clicksGoal?: number;
  color?: string;
}

export interface GetUserCampaignsQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  startAt?: string;
  endAt?: string;
  quickFilter?: string;
}
