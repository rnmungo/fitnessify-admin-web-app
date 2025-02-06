import { getIronSession } from 'iron-session';
import { HTTP_STATUS } from '@/constants/http-status';
import { handleCommonError } from '@/core/error/error-handler';
import { searchAudits } from '@/services/audit/service';
import logger from '@/utilities/loggerUtils';
import { sessionOptions } from '@/utilities/session/options';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Audit } from '@/types/audit';
import type { Paged } from '@/types/paging';
import type { HttpResponse } from '@/types/response';
import type { Session } from '@/types/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Paged<Audit> | HttpResponse>,
) {
  if (req.method === 'GET') {
    try {
      const page = req.query.page as string;
      const pageSize = req.query.pageSize as string;
      const action = req.query.action as string;
      const from = req.query.from as string;
      const to = req.query.to as string;
      const applicationId = req.query.applicationId as string;
      const session = await getIronSession<Session>(req, res, sessionOptions);
      const pagedAudits = await searchAudits({ token: session.authorization.token, filters: { currentPage: page, sizeLimit: pageSize, from, to, applicationId, action } });

      res.status(HTTP_STATUS.OK).json(pagedAudits);
    } catch (error: unknown) {
      const { status, data, detailedError } = handleCommonError(error);

      logger.error('Error handler', { error, endpoint: req.url, status, detailedError });

      res.status(status).json(data);
    }
  }
}
