export interface CreateQrPayload {
  targetUrl: string;
  title: string;
  domain: string;
  foregroundColor?: string;
  backgroundColor?: string;
}

export interface UpdateQrPayload {
  targetUrl?: string;
  title?: string;
  domain?: string;
  foregroundColor?: string;
  backgroundColor?: string;
}

export interface GetUserQrsQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  quickFilter?: string
}