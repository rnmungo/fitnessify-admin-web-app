import type { ChipColor } from '@/types/material-ui';

export const DELETE = 'DELETE';
export const GET = 'GET';
export const HEAD = 'HEAD';
export const PATCH = 'PATCH';
export const POST = 'POST';
export const PUT = 'PUT';

export const HTTP_METHODS_LIST = [
  DELETE,
  GET,
  HEAD,
  PATCH,
  POST,
  PUT,
];

export const HTTP_METHODS = Object.freeze({
  DELETE,
  GET,
  HEAD,
  PATCH,
  POST,
  PUT,
});

export const HTTP_METHOD_COLOR: Record<string, ChipColor> = {
  [DELETE]: 'error' as ChipColor,
  [GET]: 'success' as ChipColor,
  [HEAD]: 'success' as ChipColor,
  [PATCH]: 'info' as ChipColor,
  [POST]: 'warning' as ChipColor,
  [PUT]: 'info' as ChipColor,
};
