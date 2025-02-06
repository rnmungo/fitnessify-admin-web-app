import { getIronSession } from 'iron-session';
import { HTTP_STATUS } from '@/constants/http-status';
import { handleCommonError } from '@/core/error/error-handler';
import { getTenants } from '@/services/tenant/service';
import logger from '@/utilities/loggerUtils';
import { sessionOptions } from '@/utilities/session/options';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { HttpResponse } from '@/types/response';
import type { Session } from '@/types/session';
import type { Tenant } from '@/types/tenant';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<Tenant> | HttpResponse>,
) {
  if (req.method === 'GET') {
    try {
      const session = await getIronSession<Session>(req, res, sessionOptions);
      const tenants = await getTenants({ token: session.authorization.token });

      res.status(HTTP_STATUS.OK).json(tenants);
    } catch (error: unknown) {
      const { status, data, detailedError } = handleCommonError(error);

      logger.error('Error handler', { error, endpoint: req.url, status, detailedError });

      res.status(status).json(data);
    }
  }
}
