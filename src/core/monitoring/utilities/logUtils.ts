import { LEVEL_COLOR } from '../constants/log';

import type { ChipColor } from '@/types/material-ui';

export const getColorByLogLevel = (level: string): ChipColor =>
  LEVEL_COLOR[level] || 'default' as ChipColor;
