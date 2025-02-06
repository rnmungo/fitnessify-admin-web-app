import { HTTP_METHOD_COLOR } from '../constants/http-methods';

import type { ChipColor } from '@/types/material-ui';

export const getColorByHttpMethod = (method: string): ChipColor =>
  HTTP_METHOD_COLOR[method] || 'default' as ChipColor;
