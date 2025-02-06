export const urlParamsToQueryString = (params: Record<string, string>): string => {
  const queryString = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');
  return queryString;
};
