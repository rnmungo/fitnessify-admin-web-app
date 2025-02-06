import type { Audit } from '@/types/audit';
import type { Paged } from '@/types/paging';
import type { PagedAuditResponse, AuditResponse } from './types';

export const adaptPagedAudits = (data?: PagedAuditResponse): Paged<Audit> => ({
  results: (data?.results || []).map((log: AuditResponse) => ({
    action: log.action,
    applicationId: log.applicationId,
    createdAt: log.createdAt,
    id: log.id,
    ip: log.ip,
    method: log.method,
    requestBody: log.requestBody,
    resource: log.resource,
    userAgent: log.userAgent,
    userId: log.userId,
  })),
  currentPage: data?.currentPage || 0,
  sizeLimit: data?.sizeLimit || 0,
  total: data?.total || 0,
  pages: data?.pages || 0,
});
