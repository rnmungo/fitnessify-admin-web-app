import type { BaseSession } from '@/types/session';

export const defaultSession: BaseSession = {
  isLoggedIn: false,
  authorization: {
    expires: 0,
    issuedAt: 0,
    token: '',
  },
  user: {
    id: '',
    email: '',
    roles: [],
  },
};
