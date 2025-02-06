import { SetStateAction, useState } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import useDebounce from '@/core/hooks/useDebounce';
import { internalClient } from '@/services/rest-clients';
import { urlParamsToQueryString } from '@/utilities/url.utility';
import type { Paged } from '@/types/paging';
import type { Audit } from '@/types/audit';

type QueryFilterResult = {
  filtersState: Record<string, string>;
  setFiltersState: React.Dispatch<SetStateAction<Record<string, string>>>;
};

type UseQuerySearchAuditsResult =
  UseQueryResult<Paged<Audit>, Error> &
  QueryFilterResult;

const searchAudits = async (filters: Record<string, string>): Promise<Paged<Audit>> => {
  const queryString = urlParamsToQueryString(filters);
  const response = await internalClient.get(`/audit/search?${queryString}`);
  return response.data;
};

const useQuerySearchAudits = (filterParams: Record<string, string>): UseQuerySearchAuditsResult => {
  const [filtersState, setFiltersState] = useState<Record<string, string>>(filterParams);
  const debounceFilters = useDebounce(filtersState, 500);
  const query = useQuery<Paged<Audit>, Error>({
    queryKey: ['search-audits', debounceFilters],
    queryFn: () => searchAudits(debounceFilters),
    enabled: true,
  });

  return { ...query, filtersState: debounceFilters, setFiltersState };
};

export default useQuerySearchAudits;
