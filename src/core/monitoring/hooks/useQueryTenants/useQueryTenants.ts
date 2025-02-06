import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { internalClient } from '@/services/rest-clients';
import type { Tenant } from '@/types/tenant';

const getTenants = async (): Promise<Array<Tenant>> => {
  const response = await internalClient.get('/tenant');
  return response.data;
};

const useQueryTenants = (): UseQueryResult<Array<Tenant>, Error> => {
  const query = useQuery<Array<Tenant>, Error>({
    queryKey: ['tenants'],
    queryFn: getTenants,
    enabled: true,
  });

  return query;
};

export default useQueryTenants;
