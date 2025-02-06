export interface AuditResponse {
  id: string;
  createdAt: string;
  action: string;
  applicationId: string;
  ip: string;
  method: string;
  requestBody: string;
  resource: string;
  userAgent: string;
  userId: string;
};

export interface PagedAuditResponse {
  results: Array<AuditResponse>;
  currentPage: number;
  sizeLimit: number;
  total: number;
  pages: number;
};
