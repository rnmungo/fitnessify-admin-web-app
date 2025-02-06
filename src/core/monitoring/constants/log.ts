import type { ChipColor } from '@/types/material-ui';

export const LEVEL_DEBUG = 'Debug';
export const LEVEL_ERROR = 'Error';
export const LEVEL_FATAL = 'Fatal';
export const LEVEL_INFORMATION = 'Information';
export const LEVEL_VERBOSE = 'Verbose';
export const LEVEL_WARNING = 'Warning';

export const LEVEL_COLOR: Record<string, ChipColor> = {
  [LEVEL_DEBUG]: 'default' as ChipColor,
  [LEVEL_ERROR]: 'error' as ChipColor,
  [LEVEL_FATAL]: 'error' as ChipColor,
  [LEVEL_INFORMATION]: 'info' as ChipColor,
  [LEVEL_VERBOSE]: 'default' as ChipColor,
  [LEVEL_WARNING]: 'warning' as ChipColor,
};
