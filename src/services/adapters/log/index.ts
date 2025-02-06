import type { Log } from '@/types/log';
import type { Paged } from '@/types/paging';
import type { PagedLogResponse, LogResponse } from './types';

export const adaptPagedLogs = (data?: PagedLogResponse): Paged<Log> => ({
  results: (data?.results || []).map((log: LogResponse) => ({
    id: log.id,
    timeStamp: log.timeStamp,
    level: log.level,
    message: log.message,
    exception: log.exception,
    logEvent: log.logEvent,
    tenantName: log.tenantName,
    applicationId: log.applicationId,
  })),
  currentPage: data?.currentPage || 0,
  sizeLimit: data?.sizeLimit || 0,
  total: data?.total || 0,
  pages: data?.pages || 0,
});
