import { getIronSession } from 'iron-session';
import { HTTP_STATUS } from '@/constants/http-status';
import { ADMIN_ROLE } from '@/core/auth/constants/roles';
import { ApiError, handleCommonError } from '@/core/error/error-handler';
import { signIn } from '@/services/auth/service';
import logger from '@/utilities/loggerUtils';
import { sessionOptions } from '@/utilities/session/options';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { HttpResponse } from '@/types/response';
import type { Session, User } from '@/types/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | HttpResponse>,
) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;
      const { authorization, isLoggedIn, user } = await signIn({ email, password });

      if (!user.roles.includes(ADMIN_ROLE)) {
        throw new ApiError('api.auth.sign-in.error.not-authorized');
      }

      const session = await getIronSession<Session>(req, res, sessionOptions);
      session.authorization = authorization;
      session.isLoggedIn = isLoggedIn;
      session.user = user;

      await session.save();

      res.status(HTTP_STATUS.OK).json(user);
    } catch (error: unknown) {
      const { status, data, detailedError } = handleCommonError(error);

      logger.error('Error handler', { error, endpoint: req.url, status, detailedError });

      res.status(status).json(data);
    }
  }
}
