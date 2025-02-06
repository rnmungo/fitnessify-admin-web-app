import { urlParamsToQueryString } from '@/utilities/url.utility';
import { gatewayClient } from '../rest-clients';
import { adaptPagedLogs } from '../adapters/log';

type TokenParam = {
  token: string;
};

type FiltersParam = {
  filters: Record<string, string>;
};

export type SearchLogsParams = FiltersParam & TokenParam;

export const searchLogs = async ({ token, filters }: SearchLogsParams) => {
  const queryString = urlParamsToQueryString(filters);
  const response = await gatewayClient.get(
    `/api/log/search?${queryString}`,
    {
      headers: {
        'X-Application-Id': process.env.TENANT,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return adaptPagedLogs(response.data);
};
