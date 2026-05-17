export interface CreateLinkPayload {
  originalUrl: string;
  domain: string;
  customeCode?: string;
  title?: string;
  startAt?: string;
  endAt?: string;
  password?: string;
  campaignId?: string;
}

export interface UpdateLinkPayload {
  originalUrl?: string;
  domain?: string;
  customeCode?: string;
  title?: string;
  startAt?: string;
  endAt?: string;
  password?: string;
  campaignId?: string;
}

export interface GetUserLinksQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  startAt?: string;
  endAt?: string;
  campaignId?: string;
  quickFilter?: string
}