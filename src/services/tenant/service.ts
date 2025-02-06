import { gatewayClient } from '../rest-clients';
import { adaptTenant } from '../adapters/tenant';
import type { Tenant } from '@/types/tenant';

export type GetTenantsParams = {
  token: string;
};

export const getTenants = async ({ token }: GetTenantsParams): Promise<Array<Tenant>> => {
  const response = await gatewayClient.get(
    '/api/tenant',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const tenants = (response.data || []);

  return tenants.map(adaptTenant);
};
