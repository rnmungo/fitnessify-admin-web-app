import { urlParamsToQueryString } from '@/utilities/url.utility';
import { gatewayClient } from '../rest-clients';
import { adaptPagedAudits } from '../adapters/audit';

type TokenParam = {
  token: string;
};

type FiltersParam = {
  filters: Record<string, string>;
};

export type SearchAuditsParams = FiltersParam & TokenParam;

export const searchAudits = async ({ token, filters }: SearchAuditsParams) => {
  const queryString = urlParamsToQueryString(filters);
  const response = await gatewayClient.get(
    `/api/audit/search?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return adaptPagedAudits(response.data);
};
