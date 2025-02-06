export type Authorization = {
  expires: number;
  issuedAt: number;
  refreshToken?: string;
  token: string;
};

export type User = {
  id: string;
  email: string;
  roles: string[];
};

export type BaseSession = {
  isLoggedIn: boolean;
  authorization: Authorization;
  user: User;
};

export type Session = BaseSession;
