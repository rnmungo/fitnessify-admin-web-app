export interface LogResponse {
  id: string;
  timeStamp: string;
  level: string;
  message: string;
  exception: string;
  logEvent: string;
  tenantName: string;
  applicationId: string;
};

export interface PagedLogResponse {
  results: Array<LogResponse>;
  currentPage: number;
  sizeLimit: number;
  total: number;
  pages: number;
};
