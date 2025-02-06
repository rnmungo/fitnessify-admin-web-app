import { useState } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import useDebounce from '@/core/hooks/useDebounce';
import { internalClient } from '@/services/rest-clients';
import { urlParamsToQueryString } from '@/utilities/url.utility';
import type { Paged } from '@/types/paging';
import type { Log } from '@/types/log';

type QueryFilterResult = {
  filtersState: Record<string, string>;
  setFiltersState: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

type UseQuerySearchLogsResult =
  UseQueryResult<Paged<Log>, Error> &
  QueryFilterResult;

const searchLogs = async (filters: Record<string, string>): Promise<Paged<Log>> => {
  const queryString = urlParamsToQueryString(filters);
  const response = await internalClient.get(`/log/search?${queryString}`);
  return response.data;
};

const useQuerySearchLogs = (filterParams: Record<string, string>): UseQuerySearchLogsResult => {
  const [filtersState, setFiltersState] = useState<Record<string, string>>(filterParams);
  const debounceFilters = useDebounce(filtersState, 500);
  const query = useQuery<Paged<Log>, Error>({
    queryKey: ['search-logs', debounceFilters],
    queryFn: () => searchLogs(debounceFilters),
    enabled: true,
  });

  return { ...query, filtersState: debounceFilters, setFiltersState };
};

export default useQuerySearchLogs;
