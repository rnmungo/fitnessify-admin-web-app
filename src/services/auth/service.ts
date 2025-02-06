import { gatewayClient } from '../rest-clients';
import { adaptAuthorization } from '../adapters/auth';

export type SignInParams = {
  email: string;
  password: string;
};

export const signIn = async ({ email, password }: SignInParams) => {
  const response = await gatewayClient.post(
    '/api/account/login-base',
    {
      email,
      password,
    },
  );
  return adaptAuthorization(response.data);
};
