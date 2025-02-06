import type { Tenant } from '@/types/tenant';
import type { TenantResponse } from './types';

export const adaptTenant = (data: TenantResponse): Tenant => ({
  id: data.id,
  createdAt: data.createdAt,
  name: data.name,
  applicationId: data.applicationId,
  documentNumber: data.documentNumber,
  documentType: data.documentType,
  email: data.email,
  phone: data.phone,
});
